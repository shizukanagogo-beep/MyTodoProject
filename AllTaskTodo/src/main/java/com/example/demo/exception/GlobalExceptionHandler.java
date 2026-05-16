package com.example.demo.exception;

import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiError> handleResourceNotFound(ResourceNotFoundException exception) {
                return error(HttpStatus.NOT_FOUND, exception.getMessage());
        }

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<ApiError> handleBadRequest(BadRequestException exception) {
                return error(HttpStatus.BAD_REQUEST, exception.getMessage());
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ApiError> handleHttpMessageNotReadable(HttpMessageNotReadableException exception) {
                return error(HttpStatus.BAD_REQUEST, "Invalid request body");
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, Object>> handleMethodArgumentNotValid(
                        MethodArgumentNotValidException exception) {
                Map<String, String> details = exception.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .collect(Collectors.toMap(
                                                fieldError -> fieldError.getField(),
                                                fieldError -> fieldError.getDefaultMessage(),
                                                (firstMessage, secondMessage) -> firstMessage));

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(Map.of(
                                                "error", "Validation failed",
                                                "details", details));
        }

        @ExceptionHandler(HandlerMethodValidationException.class)
        public ResponseEntity<Map<String, Object>> handleHandlerMethodValidation(
                        HandlerMethodValidationException exception) {
                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(Map.of(
                                                "error", "Validation failed",
                                                "details", Map.of("request", "入力内容を確認してください")));
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiError> handleException(Exception exception) {
                return error(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }

        private ResponseEntity<ApiError> error(HttpStatus status, String message) {
                return ResponseEntity
                                .status(status)
                                .body(new ApiError(message));
        }
}
