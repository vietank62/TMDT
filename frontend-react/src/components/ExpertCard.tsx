import { Star, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface ExpertCardProps {
  id: string;
  name: string;
  title: string;
  category: string;
  rating: number;
  reviews: number;
  price: string;
  image: string;
}

const ExpertCard = ({ id, name, title, category, rating, reviews, price, image }: ExpertCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-[var(--bg)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[var(--accent)] shadow-sm">
          {category}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-[var(--text-h)] group-hover:text-[var(--accent)] transition-colors">
            {name}
          </h3>
          <div className="flex items-center space-x-1 text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-lg">
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-bold">{rating}</span>
          </div>
        </div>
        <p className="text-sm text-[var(--text)] line-clamp-2 mb-4 leading-relaxed">
          {title}
        </p>

        <div className="flex items-center text-sm text-[var(--text)] mb-6 space-x-4">
          <div className="flex items-center">
            <Clock size={16} className="mr-1 opacity-60" />
            <span>Phản hồi {'<'} 1h</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-[var(--text-h)]">{reviews}</span>
            <span className="ml-1 opacity-60">đánh giá</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <div>
            <span className="text-lg font-bold text-[var(--accent)]">{price}</span>
            <span className="text-xs text-[var(--text)] ml-1">/ phiên</span>
          </div>
          <Link
            to={`/expert/${id}`}
            className="flex items-center space-x-1 px-4 py-2 bg-[var(--accent-bg)] text-[var(--accent)] rounded-full text-sm font-bold group-hover:bg-[var(--accent)] group-hover:text-white transition-all"
          >
            <span>Đặt lịch</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpertCard;
