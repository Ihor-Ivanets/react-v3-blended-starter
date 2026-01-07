import Modal from "../Modal/Modal";
import PostList from "../PostList/PostList";
import SearchBox from "../SearchBox/SearchBox";
import Pagination from "../Pagination/Pagination";
import CreatePostForm from "../CreatePostForm/CreatePostForm";

import css from "./App.module.css";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchPosts } from "../../services/postService";
import { Post } from "../../types/post";
import EditPostForm from "../EditPostForm/EditPostForm";

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatePost, setIsCreatePost] = useState(false);
  const [isEditPost, setIsEditPost] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [debounceSearchQuery] = useDebounce(searchQuery, 300);

  const { data } = useQuery({
    queryKey: ["posts", debounceSearchQuery, currentPage],
    queryFn: () => fetchPosts(debounceSearchQuery, currentPage),
    placeholderData: keepPreviousData,
  });

  const handleSearchQuery = (newQuery: string) => {
    // console.log(newQuery);
    setSearchQuery(newQuery);
    setCurrentPage(1);
  };
  // console.log(data);

  // console.log(debounceSearchQuery);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const toggleCreate = () => {
    setIsCreatePost(!isCreatePost);
  };

  const toggleEditPost = (post?: Post) => {
    if (post) setPostToEdit(post);
    setIsEditPost(!isEditPost);
  };

  const posts = data?.posts ?? [];
  const totalPages = data?.totalCount ? Math.ceil(data.totalCount / 8) : 0;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox onSearch={handleSearchQuery} />
        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
        <button
          onClick={() => {
            toggleModal();
            toggleCreate();
          }}
          className={css.button}
        >
          Create post
        </button>
      </header>
      {isModalOpen && (
        <Modal onClose={toggleModal}>
          {isCreatePost && (
            <CreatePostForm
              onClose={() => {
                toggleModal();
                toggleCreate();
              }}
            />
          )}
          {isEditPost && postToEdit && (
            <EditPostForm
              initialValue={postToEdit}
              onClose={() => {
                toggleModal();
                toggleEditPost();
                setPostToEdit(null);
              }}
            />
          )}
        </Modal>
      )}
      {posts.length > 0 && (
        <PostList toggleModal={toggleModal} toggleEditPost={toggleEditPost} posts={posts} />
      )}
    </div>
  );
}
