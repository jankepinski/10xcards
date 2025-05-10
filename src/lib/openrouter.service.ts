import { z } from "zod";

/**
 * Error class for OpenRouter service errors
 */
export class OpenRouterServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "OpenRouterServiceError";
  }
}

/**
 * Configuration interface for OpenRouter service
 */
export interface OpenRouterConfig {
  systemMessage: string;
  modelName: string;
  modelParams: {
    temperature: number;
    max_tokens: number;
    top_p: number;
    [key: string]: number | string | boolean;
  };
  responseFormat: {
    type: string;
    json_schema?: {
      name: string;
      strict: boolean;
      schema: Record<string, unknown>;
    };
  };
}

/**
 * Request payload interface for OpenRouter API
 */
export interface RequestPayload {
  model: string;
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
  response_format?: {
    type: string;
    json_schema?: {
      name: string;
      strict: boolean;
      schema: Record<string, unknown>;
    };
  };
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  [key: string]: unknown;
}

/**
 * Response data interface from OpenRouter API
 */
export type ResponseData = Record<string, unknown>;

/**
 * Service for interacting with OpenRouter API
 */
export class OpenRouterService {
  private apiKey: string;
  private defaultConfig: OpenRouterConfig;
  private logger: Console;
  private httpClient: typeof fetch;
  private readonly API_URL = "https://openrouter.ai/api/v1/chat/completions";
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  /**
   * Creates a new OpenRouter service instance
   *
   * @param apiKey - OpenRouter API key
   * @param config - Optional configuration overrides
   */
  constructor(apiKey: string, config?: Partial<OpenRouterConfig>) {
    if (!apiKey) {
      throw new OpenRouterServiceError("API key is required", "MISSING_API_KEY");
    }

    this.apiKey = apiKey;
    this.logger = console;
    this.httpClient = fetch;

    // Default configuration
    this.defaultConfig = {
      systemMessage: "You are a helpful assistant specialized in chat interactions.",
      modelName: "gpt-4",
      modelParams: {
        temperature: 0.7,
        max_tokens: 1500,
        top_p: 1.0,
      },
      responseFormat: {
        type: "json_object",
        json_schema: {
          name: "chat_response",
          strict: true,
          schema: {
            answer: "string",
            info: "string",
          },
        },
      },
      ...config,
    };
  }

  /**
   * Sends a request to the OpenRouter API
   *
   * @param userInput - User message content
   * @returns Promise with structured response data
   * @throws OpenRouterServiceError on failure
   */
  public async sendRequest(userInput: string): Promise<ResponseData> {
    if (!userInput || userInput.trim() === "") {
      throw new OpenRouterServiceError("User input is required", "MISSING_USER_INPUT");
    }

    try {
      const payload = this._buildPayload(userInput);

      let retries = 0;
      let lastError: Error | null = null;

      while (retries < this.MAX_RETRIES) {
        try {
          const response = await this.httpClient(this.API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
              "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://api.openrouter.ai",
              "X-Title": "10xcards",
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new OpenRouterServiceError(
              `API request failed with status ${response.status}`,
              `API_ERROR_${response.status}`,
              errorData
            );
          }

          const rawResponse = await response.json();
          return this._parseResponse(rawResponse);
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          // Only retry for network errors or 5xx server errors
          if (error instanceof OpenRouterServiceError && !error.code.startsWith("API_ERROR_5")) {
            throw error;
          }

          retries++;
          if (retries < this.MAX_RETRIES) {
            await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY * retries));
          }
        }
      }

      throw lastError || new OpenRouterServiceError("Request failed after retries", "MAX_RETRIES_EXCEEDED");
    } catch (error) {
      this._handleError(error);
      throw error;
    }
  }

  /**
   * Updates the service configuration
   *
   * @param newConfig - New configuration options to apply
   */
  public setConfiguration(newConfig: Partial<OpenRouterConfig>): void {
    this.defaultConfig = {
      ...this.defaultConfig,
      ...newConfig,
      modelParams: {
        ...this.defaultConfig.modelParams,
        ...(newConfig.modelParams || {}),
      },
      responseFormat: {
        ...this.defaultConfig.responseFormat,
        ...(newConfig.responseFormat || {}),
      },
    };
  }

  /**
   * Returns the current service configuration
   *
   * @returns Current OpenRouter configuration
   */
  public getConfiguration(): OpenRouterConfig {
    return { ...this.defaultConfig };
  }

  /**
   * Builds a request payload from user input and service configuration
   *
   * @param userInput - User message content
   * @returns Formatted request payload
   * @private
   */
  private _buildPayload(userInput: string): RequestPayload {
    return {
      model: this.defaultConfig.modelName,
      messages: [
        {
          role: "system",
          content: this.defaultConfig.systemMessage,
        },
        {
          role: "user",
          content: userInput,
        },
      ],
      response_format: this.defaultConfig.responseFormat,
      ...this.defaultConfig.modelParams,
    };
  }

  /**
   * Parses and validates the API response
   *
   * @param rawResponse - Raw API response
   * @returns Structured response data
   * @throws OpenRouterServiceError for invalid responses
   * @private
   */
  private _parseResponse(rawResponse: unknown): ResponseData {
    try {
      if (!rawResponse || typeof rawResponse !== "object") {
        throw new OpenRouterServiceError("Invalid API response format", "INVALID_RESPONSE_FORMAT", rawResponse);
      }

      const response = rawResponse as Record<string, unknown>;

      // Check for required response properties
      const choices = response.choices as Record<string, unknown>[] | undefined;
      if (!choices || !Array.isArray(choices) || choices.length === 0) {
        throw new OpenRouterServiceError("No choices in API response", "MISSING_CHOICES", response);
      }

      // Extract the content from the response
      const firstChoice = choices[0] as Record<string, unknown>;
      const message = firstChoice.message as Record<string, unknown> | undefined;
      const content = message?.content;

      if (!content) {
        throw new OpenRouterServiceError("Missing content in API response", "MISSING_CONTENT", firstChoice);
      }

      // If response format is JSON, parse and validate the content
      if (
        this.defaultConfig.responseFormat.type === "json_object" ||
        this.defaultConfig.responseFormat.type === "json_schema"
      ) {
        try {
          // Parse JSON content
          const parsedContent = typeof content === "string" ? JSON.parse(content) : content;

          // If a JSON schema was specified, validate the response against it
          if (this.defaultConfig.responseFormat.json_schema && this.defaultConfig.responseFormat.json_schema.strict) {
            this._validateAgainstSchema(parsedContent, this.defaultConfig.responseFormat.json_schema.schema);
          }

          return parsedContent as ResponseData;
        } catch (error) {
          throw new OpenRouterServiceError("Failed to parse JSON response", "JSON_PARSE_ERROR", { error, content });
        }
      }

      // For non-JSON responses, return the content directly
      return { content };
    } catch (error) {
      if (error instanceof OpenRouterServiceError) {
        throw error;
      }

      throw new OpenRouterServiceError(
        "Error parsing API response",
        "RESPONSE_PARSING_ERROR",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Validates response data against a JSON schema
   *
   * @param data - Data to validate
   * @param schema - Schema to validate against
   * @throws OpenRouterServiceError for schema validation failures
   * @private
   */
  private _validateAgainstSchema(data: unknown, schema: Record<string, unknown>): void {
    try {
      // Convert schema definition to Zod schema
      const zodSchema = this._buildZodSchema(schema);
      zodSchema.parse(data);
    } catch (error) {
      throw new OpenRouterServiceError("Response does not match expected schema", "SCHEMA_VALIDATION_ERROR", error);
    }
  }

  /**
   * Builds a Zod schema from a schema definition object
   *
   * @param schema - Schema definition
   * @returns Zod schema
   * @private
   */
  private _buildZodSchema(schema: Record<string, unknown>): z.ZodType {
    const schemaObj: Record<string, z.ZodType> = {};

    for (const [key, type] of Object.entries(schema)) {
      if (type === "string") {
        schemaObj[key] = z.string();
      } else if (type === "number") {
        schemaObj[key] = z.number();
      } else if (type === "boolean") {
        schemaObj[key] = z.boolean();
      } else if (typeof type === "object") {
        schemaObj[key] = this._buildZodSchema(type as Record<string, unknown>);
      } else {
        // Default to unknown for unspecified types
        schemaObj[key] = z.unknown();
      }
    }

    return z.object(schemaObj);
  }

  /**
   * Centralizes error handling logic
   *
   * @param error - Error to handle
   * @private
   */
  private _handleError(error: unknown): void {
    if (error instanceof OpenRouterServiceError) {
      this.logger.error(`OpenRouter error (${error.code}):`, error.message, error.details);
    } else {
      this.logger.error("Unexpected error in OpenRouter service:", error);
    }
  }
}
