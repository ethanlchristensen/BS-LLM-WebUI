from .base_llm_service import BaseLLMService
from .ollama_service import OllamaService
from .openai_service import OpenAIService
from .azure_openai_service import AzureOpenAIService
from .anthropic_service import AnthropicService
from .google_ai_service import GoogleAIService

class LLMServiceFactory:
    @staticmethod
    def get_service(provider: str = "ollama") -> BaseLLMService:
        if provider == "ollama":
            return OllamaService()
        elif provider == "openai":
            return OpenAIService()
        elif provider == "azure_openai":
            return AzureOpenAIService()
        elif provider == "anthropic":
            return AnthropicService()
        elif provider == "google":
            return GoogleAIService()
        else:
            return None