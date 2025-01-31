import React, { useEffect, useState } from 'react';
import { FaTrashAlt, FaEdit } from 'react-icons/fa';
import { BaseUrl, delet, get, patch } from '../services/Endpoint';
import toast from 'react-hot-toast';

export default function AllPost() {
  const [posts, setPosts] = useState([]);
  const [loaddata, setLoaddata] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    desc: '',
    image: null
  });

  const handleDelete = async(postId) => {
    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (confirmed) {
      try {
        const response = await delet(`/blog/delete/${postId}`);
        const data = response.data;
        if (data.success) {
          toast.success(data.message);
          setLoaddata(!loaddata);
        } else {
          toast.error('Failed to delete the post.');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error(error.response?.data?.message || "An unexpected error occurred.");
      }
    }
  };

  const handleUpdate = (post) => {
    setEditingPost(post);
    setEditForm({
      title: post.title,
      desc: post.desc,
      image: null
    });
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setEditForm(prev => ({ ...prev, image: files[0] }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('desc', editForm.desc);
      if (editForm.image) {
        formData.append('postimg', editForm.image);
      }

      const response = await patch(`/blog/update/${editingPost._id}`, formData);
      if (response.data.success) {
        toast.success('Post updated successfully');
        setEditingPost(null);
        setLoaddata(!loaddata);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update post');
    }
  };

  useEffect(() => {
    const getPosts = async () => {
      try {
        const response = await get("/blog/GetPosts");
        setPosts(response.data.posts);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch posts");
      }
    };
    getPosts();
  }, [loaddata]);

  return (
    <div className="container">
      <h1 className="text-center mb-4 text-white">All Posts</h1>
      
      {/* Edit Modal */}
      {editingPost && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Edit Post</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditingPost(null)}></button>
              </div>
              <form onSubmit={handleSubmitUpdate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white"
                      name="title"
                      value={editForm.title}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control bg-dark text-white"
                      name="desc"
                      value={editForm.desc}
                      onChange={handleInputChange}
                      rows="4"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Image (optional)</label>
                    <input
                      type="file"
                      className="form-control bg-dark text-white"
                      name="image"
                      onChange={handleInputChange}
                      accept="image/*"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingPost(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {posts.map((post) => (
          <div className="col-md-4 mb-4" key={post._id}>
            <div className="card h-100 bg-dark text-white">
              <img 
                src={`${BaseUrl}/images/${post.image}`} 
                className="card-img-top" 
                alt={post.title}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body">
                <h5 className="card-title">{post.title}</h5>
                <p className="card-text">{post.desc.substring(0, 100)}...</p>
              </div>
              <div className="card-footer d-flex justify-content-between">
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(post._id)}
                >
                  <FaTrashAlt /> Delete
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => handleUpdate(post)}
                >
                  <FaEdit /> Update
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
