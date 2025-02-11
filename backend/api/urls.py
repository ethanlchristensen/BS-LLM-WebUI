from django.contrib import admin
from django.urls import path, include
from . import views


urlpatterns = [
    path("", views.Index.as_view(), name="index"),
    path("conversations/", views.ConversationListCreateView.as_view(), name="conversations"),
    path("conversations/<str:pk>/", views.ConversationDetailView.as_view(), name="conversation-detail"),
    path("messages/user/", views.UserListCreateView.as_view(), name="user-messages"),
    path("messages/user/<int:pk>/", views.UserMessageDetailView.as_view(), name="user-message-detail"),
    path("messages/assistant/", views.AssistantListCreateView.as_view(), name="assistant-messages"),
    path("messages/assistant/<int:pk>/", views.AssistantMessageDetailView.as_view(), name="assistant-message-detail"),
    path("models/", views.ModelListCreateView.as_view(), name="models"),
    path("models/<int:pk>/", views.ModelDetailWithInfoView.as_view(), name="models"),
    path("models/populate/", views.ModelsPopulateAPIView.as_view(), name="models-populate"),
    path("chat/", views.ChatAPIView.as_view(), name="chat"),
    path("chat/stream/", views.StreamChatAPIView.as_view(), name="chat-stream"),
    path("suggestions/", views.ThreeSuggestionsAPIView.as_view(), name="suggestions"),
    path("tools/", views.ToolsListCreateView.as_view(), name="tools"),
    path("tools/<str:pk>/", views.ToolsDetailView.as_view(), name="tools-detail")
]