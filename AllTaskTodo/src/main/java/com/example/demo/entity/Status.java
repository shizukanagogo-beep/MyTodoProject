package com.example.demo.entity;

public enum Status {
	INCOMPLETE("未着手"),
	DONE("完了");

	private final String label;

	Status(String label) {
		this.label = label;
	}

	public String getLabel() {
		return label;
	}
}
