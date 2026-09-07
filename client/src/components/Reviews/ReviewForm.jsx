import { useState } from "react";
import { createReview } from "../../services/reviewService";

function ReviewForm({ productId, onReviewAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    title: "",
    comment: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createReview({
        product: productId,
        ...formData,
      });

      alert("Review submitted successfully!");

      setFormData({
        name: "",
        email: "",
        rating: 5,
        title: "",
        comment: "",
      });

      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to submit review");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6">
        Write a Review
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-4 py-2"
        />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-4 py-2"
        />

        <select
          name="rating"
          value={formData.rating}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2"
        >
          <option value="5">⭐⭐⭐⭐⭐ (5)</option>
          <option value="4">⭐⭐⭐⭐ (4)</option>
          <option value="3">⭐⭐⭐ (3)</option>
          <option value="2">⭐⭐ (2)</option>
          <option value="1">⭐ (1)</option>
        </select>

        <input
          type="text"
          name="title"
          placeholder="Review Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-4 py-2"
        />

        <textarea
          name="comment"
          rows="5"
          placeholder="Write your review..."
          value={formData.comment}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-4 py-2"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
}

export default ReviewForm;