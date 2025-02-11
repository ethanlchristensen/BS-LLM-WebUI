import os
import json
import pytz
import requests
import datetime
from io import StringIO
from django.core.management import call_command
from django.core.files.storage import default_storage
from django.http import StreamingHttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.views import *
from rest_framework.permissions import *
from rest_framework.response import Response
from rest_framework import status, generics
from .models import (
    Conversation,
    UserMessage,
    AssistantMessage,
    Model,
    ContentVariation,
    Tool,
)
from .serializers import (
    ConversationSerializer,
    UserMessageSerializer,
    AssistantMessageSerializer,
    ConversationDetailSerializer,
    ModelSerializer,
    ToolSerializer,
)
from .services import (
    OllamaService,
    OpenAIService,
    AzureOpenAIService,
    LLMServiceFactory,
)
from users.models import Settings
from users.serializers import UserSerializer

PROMPTS = {
    "three_suggestions": open(
        os.path.join(os.getcwd(), "api", "prompts", "three_suggestions.txt")
    ).read()
}


class Index(APIView):
    def get(self, request):
        return Response({"message": "Hello World!"}, status=status.HTTP_200_OK)

    permission_classes = [AllowAny]


class ConversationListCreateView(generics.ListCreateAPIView):
    queryset = None
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)

    def get(self, request):
        conversations = self.get_queryset()
        serializer = self.get_serializer(conversations, many=True)

        utc = pytz.UTC  # UTC timezone instance

        for conversation in serializer.data:
            # Parse and make the `created_at` aware of UTC
            created_at = datetime.datetime.fromisoformat(
                conversation["created_at"].replace("Z", "+00:00")
            ).astimezone(utc)

            # Get current time in UTC
            now_utc = datetime.datetime.now(datetime.UTC)

            # Calculate the time difference in days
            days_difference = (now_utc.date() - created_at.date()).days

            if days_difference == 0:
                conversation["grouping"] = "Today"
            elif days_difference <= 7:
                conversation["grouping"] = "This Week"
            elif now_utc.month == created_at.month:
                conversation["grouping"] = "This Month"
            else:
                conversation["grouping"] = "Old"

        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ConversationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = None
    serializer_class = ConversationDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)

    def get_object(self):
        conversation = super().get_object()

        if conversation.user != self.request.user:
            raise PermissionDenied(
                "You do not have permission to access this conversation."
            )

        return conversation

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)


class UserListCreateView(generics.ListCreateAPIView):
    queryset = None
    serializer_class = UserMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserMessage.objects.filter(
            conversation__user=self.request.user,
            is_deleted=False,
        )

    def perform_create(self, serializer):
        # Get the file from request.FILES
        image = self.request.FILES.get("image")
        conversation_id = self.request.data.get("conversation")

        # Get the conversation and verify ownership
        conversation = get_object_or_404(
            Conversation, id=conversation_id, user=self.request.user
        )

        # Save with the image if present
        if image:
            serializer.save(conversation=conversation, image=image)
        else:
            serializer.save(conversation=conversation)

    def get(self, request):
        messages = self.get_queryset()
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)


class UserMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = None
    serializer_class = UserMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserMessage.objects.filter(conversation__user=self.request.user)

    def get_object(self):
        message = super().get_object()
        if message.conversation.user != self.request.user:
            raise PermissionDenied("You do not have permission to access this message.")
        return message

    def destroy(self, request, *args, **kwargs):
        message = self.get_object()
        message.soft_delete()  # Use soft delete instead of hard delete
        return Response(status=204)


class AssistantListCreateView(generics.ListCreateAPIView):
    queryset = None
    serializer_class = AssistantMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AssistantMessage.objects.filter(
            conversation__user=self.request.user, is_delete=False
        )

    def post(self, request, *args, **kwargs):
        # Get the conversation and model from the request
        conversation_id = request.data.get("conversation")
        model_id = request.data.get("model")

        # Retrieve the conversation and model instances
        conversation = Conversation.objects.get(
            id=conversation_id, user=self.request.user
        )
        model = Model.objects.get(id=model_id)

        # Retireve the user message used to generate this assistant message
        user_message = UserMessage.objects.get(id=request.data.get("generated_by"))

        # Create an AssistantMessage instance without committing to the database
        assistant_message = AssistantMessage(
            conversation=conversation,
            model=model,
            provider=request.data.get("provider"),
            liked=request.data.get("liked", False),
            generated_by=user_message,
            tools_used=request.data.get("tools_used", [])
        )

        assistant_message.save()  # Save the AssistantMessage to generate an ID

        content_variations_data = request.data.get("content_variations", [])
        for content in content_variations_data:
            # Create a new ContentVariation instance
            content_variation = ContentVariation.objects.create(content=content)
            # Associate it with the AssistantMessage
            assistant_message.content_variations.add(content_variation)

        serializer = self.get_serializer(assistant_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AssistantMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = None
    serializer_class = AssistantMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AssistantMessage.objects.filter(conversation__user=self.request.user)

    def get_object(self):
        message = super().get_object()
        if message.conversation.user != self.request.user:
            raise PermissionDenied("You do not have permission to access this message.")
        return message

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        # Add single content variation if provided
        new_content = request.data.get("new_content_variation", None)
        if new_content:
            content_variation = ContentVariation.objects.create(content=new_content)
            instance.content_variations.add(content_variation)

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        message = self.get_object()
        message.soft_delete()  # Use soft delete instead of hard delete
        return Response(status=204)


class ModelListCreateView(generics.ListCreateAPIView):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer
    permission_classes = [IsAuthenticated]


class ModelDetailWithInfoView(APIView):

    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ollama_service = OllamaService()

    # Fetch and combine model data and Ollama details (GET)
    def get(self, request, pk):
        try:
            # Fetch model from the database using the primary key (pk)
            model = Model.objects.get(pk=pk)
            serializer = ModelSerializer(model)
            if model.provider == "ollama":
                # Query the Ollama API for additional details
                model_info = self.ollama_service.get_model(serializer.data["name"]).dict()
                if model_info:
                    # Remove unnecessary fields from the Ollama response
                    del model_info["details"]
                    del model_info["modelinfo"]

                    # Combine the database model data with the Ollama service response
                    combined_data = {
                        **serializer.data,  # The serialized model data from the database
                        "details": model_info,  # The extra details fetched from Ollama
                    }

                    return Response(combined_data, status=status.HTTP_200_OK)
                else:
                    return Response(
                        {"error": "Failed to fetch response from Ollama API."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
            else:
                combined_data = {
                    **serializer.data,
                    "details": {},  # If the model is not from Ollama, just return an empty details field
                }
                return Response(combined_data, status=status.HTTP_200_OK)
        except Model.DoesNotExist:
            return Response(
                {"error": "Model not found."}, status=status.HTTP_404_NOT_FOUND
            )
        except requests.exceptions.RequestException as e:
            print(f"requests.exception.RequestException: {e}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            print(f"Exception: {e}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # Update a model (PUT)
    def put(self, request, pk):
        try:
            ollama_model = Model.objects.get(pk=pk)
            serializer = ModelSerializer(ollama_model, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Model.DoesNotExist:
            return Response(
                {"error": "Model not found."}, status=status.HTTP_404_NOT_FOUND
            )

    # Delete a model (DELETE)
    def delete(self, request, pk):
        try:
            ollama_model = Model.objects.get(pk=pk)
            ollama_model.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        except Model.DoesNotExist:
            return Response(
                {"error": "Model not found."}, status=status.HTTP_404_NOT_FOUND
            )


class ModelsPopulateAPIView(APIView):
    """
    View to handle chat requests with the Ollama API.
    """

    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ollama_service = OllamaService()

    def post(self, request):
        try:
            output = StringIO()
            response = []
            response += json.loads(
                call_command("populate_ollama_models", stdout=output)
            )
            response += json.loads(
                call_command("populate_openai_models", stdout=output)
            )

            return Response(
                {
                    "message": "Successfully re-populated provider models!",
                    "details": output.getvalue(),
                    "data": response,
                },
                status=status.HTTP_200_OK,
            )

        except requests.exceptions.RequestException as e:
            return Response(
                {"error": str(e), "message": "Failed to re-populate provider models!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class BaseChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.llm_service = None

    def post(self, request):
        try:
            user_settings = Settings.objects.get(user=request.user)
            user_tools = [str(tool.id) for tool in Tool.objects.filter(user=request.user)]
            model = request.data.get("model")
            messages = request.data.get("messages")
            provider = request.data.get("provider")
            conversation_id = request.data.get("conversation")
            use_tools = True if request.data.get("useTools") else False

            if not model or not messages or not provider:
                return Response(
                    {"error": "Model, messages, and provider are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if user_settings.use_message_history and conversation_id:
                conversation = Conversation.objects.filter(
                    id=conversation_id, user=request.user
                ).first()

                if not conversation:
                    return Response(
                        {"error": "Conversation not found"},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                serializer = ConversationDetailSerializer(conversation)
                serialized_data = serializer.data
                old_messages = serialized_data.get("messages", [])
                old_messages = [message for message in old_messages if not message["is_deleted"]]
                message_history_count = user_settings.message_history_count
                old_messages = old_messages[-message_history_count:-1]
                for idx in range(len(old_messages)):
                    role = old_messages[idx]["type"]
                    if role == "user":
                        old_messages[idx] = {
                            "role": role,
                            "content": old_messages[idx]["content"],
                        }
                    elif role == "assistant":
                        old_messages[idx] = {
                            "role": role,
                            "content": old_messages[idx]["content_variations"][-1][
                                "content"
                            ],
                        }
                messages = old_messages + messages
            
            self.llm_service = LLMServiceFactory.get_service(provider)

            if not self.llm_service:
                return Response(
                    {"error": f"'{provider}' is an invalid provider."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            # chat_completion = self.llm_service.chat(model=model, messages=messages, use_tools=user_settings.use_tools, user_tools=user_tools)
            chat_completion = self.llm_service.chat(model=model, messages=messages, use_tools=use_tools, user_tools=user_tools)

            if chat_completion and "error" not in chat_completion:
                return Response(chat_completion, status=status.HTTP_200_OK)
            elif chat_completion and "error" in chat_completion:
                return Response(
                    chat_completion, status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            else:
                return Response(
                    {"error": f"Failed to fetch response from {provider} API."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        except Settings.DoesNotExist:
            return Response(
                {"error": "User settings not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BaseStreamingAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.llm_service = None

    def post(self, request):
        try:
            user_settings = Settings.objects.get(user=request.user)
            user_tools = [str(tool.id) for tool in Tool.objects.filter(user=request.user)]
            model = request.data.get("model")
            provider = request.data.get("provider")
            messages = request.data.get("messages")
            conversation_id = request.data.get("conversation")
            use_tools = True if request.data.get("useTools") else False

            if not model or not provider or not messages:
                return Response(
                    {"error": "Model, provider, and messages are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if user_settings.use_message_history and conversation_id:
                conversation = Conversation.objects.filter(
                    id=conversation_id, user=request.user
                ).first()

                if not conversation:
                    return Response(
                        {"error": "Conversation not found"},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                serializer = ConversationDetailSerializer(conversation)
                serialized_data = serializer.data
                old_messages = serialized_data.get("messages", [])
                message_history_count = user_settings.message_history_count
                old_messages = old_messages[-message_history_count:-1]
                for idx in range(len(old_messages)):
                    role = old_messages[idx]["type"]
                    if role == "user":
                        old_messages[idx] = {
                            "role": role,
                            "content": old_messages[idx]["content"],
                        }
                    elif role == "assistant":
                        old_messages[idx] = {
                            "role": role,
                            "content": old_messages[idx]["content_variations"][-1][
                                "content"
                            ],
                        }
                messages = old_messages + messages

            self.llm_service = LLMServiceFactory.get_service(provider)

            if not self.llm_service:
                return Response(
                    {"error": f"'{provider}' is an invalid provider."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            def stream_response():
                for chunk in self.llm_service.chat_stream(model=model, messages=messages, use_tools=use_tools, user_tools=user_tools):
                    if chunk and not isinstance(chunk, str):
                        if "error" in chunk:
                            return Response(
                                {"message": chunk},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            )
                        if provider == "ollama":
                            data = f"data: {json.dumps(chunk)}\n\n"
                        else:
                            data = f"data: {json.dumps(chunk)}\n\n"
                        
                        yield data.encode("utf-8")

            response = StreamingHttpResponse(
                stream_response(), content_type="text/event-stream"
            )

            response["Cache-Control"] = "no-cache"
            response["X-Accel-Buffering"] = "no"
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
            response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
            response["Access-Control-Allow-Credentials"] = "true"

            return response

        except Settings.DoesNotExist:
            return Response(
                {"error": "User settings not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BaseThreeSuggestionsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.llm_service = None
        self.buckets = [
            "Programming Questions",
            "Fun Facts",
            "General Knowledge",
            "Story Creation",
            "Jokes and Humor",
            "Career Advice",
            "Language Learning",
            "Scientific Explanations",
            "Mental Health & Wellness",
            "Creative Writing",
            "DIY & Home Projects",
            "Music & Art",
            "Historical Events",
            "Travel Tips",
            "Technology Trends",
            "Life Skills",
        ]

    def post(self, request):
        model = request.data.get("model")
        provider = request.data.get("provider")
        count = request.data.get("count")

        if model is None or provider is None or count is None:
            return Response(
                {"error": "Model, provider, and count are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(count, int):
            return Response(
                {"error": "Parameter count must be a number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        base_prompt = PROMPTS.get("three_suggestions")

        self.llm_service = LLMServiceFactory.get_service(provider)

        if not self.llm_service:
            return Response(
                {"error": f"'{provider}' is an invalid provider."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        suggestions = []
        available_buckets = self.buckets[:]
        used_buckets = []

        for _ in range(count):
            try:
                prompt = base_prompt.replace(
                    "${buckets}", "- " + "\n- ".join(available_buckets) + "\n"
                ).replace(
                    "${suggestions}",
                    (
                        "\n- "
                        + "\n- ".join(
                            [suggestion["summary"] for suggestion in suggestions]
                        )
                        if suggestions
                        else "No suggetions generated yet"
                    ),
                )

                chat_completion = self.llm_service.chat(
                    model=model, messages=[{"role": "user", "content": prompt}]
                )

                suggestion = json.loads(
                    chat_completion["message"]["content"]
                    .replace("```json", "")
                    .replace("```", "")
                )

                if (
                    "bucket" in suggestion
                    and "summary" in suggestion
                    and "question" in suggestion
                ):
                    suggestions.append(suggestion)
            except Exception as e:
                print(f"three suggestions error: {e}")

        try:
            payload = {"suggestions": suggestions}
            return Response(payload, status=status.HTTP_200_OK)
        except Exception as e:
            chat_completion["external_message"] = f"Failed to decode the json -> {e}"
            return Response(
                chat_completion, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChatAPIView(BaseChatAPIView):
    pass


class StreamChatAPIView(BaseStreamingAPIView):
    pass


class ThreeSuggestionsAPIView(BaseThreeSuggestionsAPIView):
    pass


class ToolFileMixin:
    """Mixin to handle saving and deleting script files."""

    def save_script_to_file(self, tool):
        script_file_path = os.path.join(os.getcwd(), "api", "tools", f"{tool.id}.py")
        with open(script_file_path, "w") as file:
            file.write(tool.script.replace("\r", ""))

    def delete_script_file(self, tool):
        script_file_path = os.path.join(os.getcwd(), "api", "tools", f"{tool.id}.py")
        if os.path.exists(script_file_path):
            os.remove(script_file_path)


class ToolsListCreateView(ToolFileMixin, generics.ListCreateAPIView):
    serializer_class = ToolSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Tool.objects.filter(user=self.request.user)

    def get(self, request):
        tools = self.get_queryset()
        serializer = self.get_serializer(tools, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        tool = serializer.save(user=self.request.user)
        self.save_script_to_file(tool)


class ToolsDetailView(ToolFileMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ToolSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Tool.objects.filter(user=self.request.user)

    def get_object(self):
        tool = super().get_object()
        if tool.user != self.request.user:
            raise PermissionDenied("You do not have permission to access this tool.")
        return tool

    def perform_update(self, serializer):
        tool = serializer.save(user=self.request.user)
        self.save_script_to_file(tool)

    def perform_destroy(self, instance):
        self.delete_script_file(instance)
        super().perform_destroy(instance)
