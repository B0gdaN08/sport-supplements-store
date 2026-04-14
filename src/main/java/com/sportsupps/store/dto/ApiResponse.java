package com.sportsupps.store.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private Integer count;
    private String error;
    private String message;
    private String token;
    private Object user;

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder().success(true).data(data).build();
    }

    public static <T> ApiResponse<T> list(java.util.List<T> data) {
        return ApiResponse.<T>builder()
                .success(true)
                .count(data.size())
                .data((T) data)
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder().success(false).error(message).build();
    }

    public static <T> ApiResponse<T> deleted(String message) {
        return ApiResponse.<T>builder().success(true).message(message).build();
    }
}
