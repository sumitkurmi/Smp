import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setLoading } from "../../redux/slices/conditionSlice";

const Loading = () => {
	const dispatch = useDispatch();
	const [showCancel, setShowCancel] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setShowCancel(true), 10000);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm text-slate-200">
			{/* Spinner */}
			<div className="relative">
				<div className="w-16 h-16 border-4 border-t-yellow-400 border-richblack-600 rounded-full animate-spin" />
				<div className="absolute inset-0 flex items-center justify-center text-yellow-400 text-sm font-bold">
					...
				</div>
			</div>
			<p className="mt-4 text-sm text-richblack-200">Please wait</p>

			{/* Cancel Button */}
			{showCancel && (
				<div className="mt-6">
					<button
						onClick={() => dispatch(setLoading(false))}
						className="py-2 px-5 font-semibold rounded-full border border-slate-600 bg-slate-800 hover:bg-black transition-all"
					>
						Cancel
					</button>
				</div>
			)}
		</div>
	);
};

export default Loading;

