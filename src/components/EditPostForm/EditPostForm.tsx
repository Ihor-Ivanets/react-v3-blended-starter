import * as Yup from "yup";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";

import css from "./EditPostForm.module.css";
import { Post } from "../../types/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editPost } from "../../services/postService";

interface EditPostFormProps {
  onClose: () => void;
  initialValue: Post;
}

interface FormValues {
  id: number;
  title: string;
  body: string;
}

const PostSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, "The title must be at least 3 characters long.")
    .max(50, "The title should be no longer than 50 characters.")
    .required("Title required field"),

  body: Yup.string()
    .max(500, "The body should be no longer than 500 characters.")
    .required("Body required field"),
});

export default function EditPostForm({ onClose, initialValue }: EditPostFormProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: editPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      alert("Edit post");
      onClose();
    },
  });

  const handleSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    mutation.mutate(values);
    actions.resetForm();
  };

  return (
    <Formik initialValues={initialValue} onSubmit={handleSubmit} validationSchema={PostSchema}>
      <Form className={css.form}>
        <div className={css.formGroup}>
          <label htmlFor="title">Title</label>
          <Field id="title" type="text" name="title" className={css.input} />
          <ErrorMessage name="title" component="span" className={css.error} />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="body">Content</label>
          <Field id="body" as="textarea" name="body" rows={8} className={css.textarea} />
          <ErrorMessage name="body" component="span" className={css.error} />
        </div>

        <div className={css.actions}>
          <button onClick={onClose} type="button" className={css.cancelButton}>
            Cancel
          </button>
          <button type="submit" className={css.submitButton} disabled={mutation.isPending}>
            Edit post
          </button>
        </div>
      </Form>
    </Formik>
  );
}
