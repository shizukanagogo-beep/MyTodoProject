package com.example.demo.dto;

import java.time.LocalDate;

import com.example.demo.entity.Status;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TodoForm {

    @NotBlank(message = "タイトルを入力してください")
    @Size(max = 100, message = "タイトルは100文字以内で入力してください")
    private String title;

    private Status status;
    private LocalDate dueDate;
    private Boolean dueDateUndecided;
    private Boolean existsDueDate; // trueなら日付あり／未定
    private Integer categoryId;
    private Boolean categoryUnassigned;
    private Integer parentId;
    private Boolean hasFlag;
    private Boolean daily;

    @Min(value = 0, message = "期限超過時の挙動は0以上で指定してください")
    @Max(value = 3, message = "期限超過時の挙動は3以下で指定してください")
    private Integer overdueBehavior;

    @Size(max = 500, message = "詳細は500文字以内で入力してください")
    private String details;

    private Boolean autoCarryOver;
    private Integer sortOrder;

}
