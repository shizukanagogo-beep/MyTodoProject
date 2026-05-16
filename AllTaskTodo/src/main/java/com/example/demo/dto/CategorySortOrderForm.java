package com.example.demo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CategorySortOrderForm {
    @NotNull(message = "カテゴリIDは必須です")
    private Integer id;

    @NotNull(message = "並び順は必須です")
    @Min(value = 1, message = "並び順は1以上で指定してください")
    private Integer sortOrder;
}
