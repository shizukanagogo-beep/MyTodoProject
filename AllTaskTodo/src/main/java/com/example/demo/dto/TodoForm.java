package com.example.demo.dto;

import java.time.LocalDate;

import com.example.demo.entity.Status;

import lombok.Data;

@Data
public class TodoForm {
    private String title;
    private Status status;
    private LocalDate dueDate;
    private Boolean existsDueDate; // trueなら「期限があるもの全部」
    private Integer categoryId;
    private Boolean categoryUnassigned;
    private Boolean hasFlag;
    private Boolean daily;
    private Integer overdueBehavior;
    private String details;
    private Boolean autoCarryOver;
    private Integer sortOrder;

}
