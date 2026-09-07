import { useEffect, useState } from "react";
import { getReviews } from "../../services/reviewService";

function ReviewList({ productId }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const data = await getReviews(productId);
      setReviews(data);
    } catch (error) {
      console.error("Error loading reviews:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6">
        Customer Reviews
      </h2>

      {reviews.length === 0 ? (
        <p className="text-gray-500">
          No reviews yet.
        </p>
      ) : (
        reviews.map((review) => (
          <div
            key={review._id}
            className="border rounded-lg p-4 mb-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">
                {review.title}
              </h3>

              <span>
                {"⭐".repeat(review.rating)}
              </span>
            </div>

            <p className="text-gray-700 mb-2">
              {review.comment}
            </p>

            <p className="text-sm text-gray-500">
              By {review.name}
            </p>

            <p className="text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default ReviewList;