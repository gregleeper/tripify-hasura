import React from "react";
import * as Yup from "yup";

const checkFileSize = value => {
  if (value) {
    if (value.size > 1000000 * 15) {
      return false;
    }
  }
  return true;
};

const checkFileType = value => {
  if (!value) {
    if (/recipe\/edit\//i.test(window.location.pathname)) {
      return true;
    }
  }

  if (value) {
    if (
      value.type === "image/jpeg" ||
      value.type === "image/png" ||
      value.type === "image/svg+xml"
    ) {
      return true;
    }
  }
  return false;
};

export const RecipeSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, "Title needs to be longer.")
    .max(40, "Title is too long")
    .required("Title is required"),
  file: Yup.mixed()
    .test("is-too-large", "File is too large.", value => checkFileSize(value))
    .test(
      "is-valid-type",
      "File type is invalid. Use jpg, png, or svg",
      value => checkFileType(value)
    ),
  description: Yup.string()
    .min(2, "Description is too short.")
    .max(500, "Description is too long.")
    .required("A description is required."),
  // ingredients: Yup.array()
  //     .min(2, 'A recipe must have more than 1 ingredient.')
  //     .max(100, 'Too many ingredients')
  //     .required('Ingredients are required.'),
  directions: Yup.string()
    .required()
    .min(2, "More directions are required.")
    .max(2000, "Directions are too long."),
  tags: Yup.array(),
  categories: Yup.array().required("At least 1 category is required")
});
