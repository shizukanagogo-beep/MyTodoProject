package com.example.demo.entity;

import java.time.LocalDate;

import lombok.Data;

@Data
public class Todo {
    private Integer id;
    private Integer categoryId;
    private String title;
    private Status status;
    private String details;
    private LocalDate dueDate;
    private Boolean autoCarryOver;
    private Boolean daily;
    private Boolean hasFlag;
    private Integer overdueBehavior;
}
