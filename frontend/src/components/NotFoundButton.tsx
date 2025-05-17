import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';

const NotFoundButton = () => {
  const navigate = useNavigate();
  
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-gradient-to-br from-sky-400 to-purple-300 p-5 text-white">
      <div className="
        bg-white/20 backdrop-blur-sm
        p-10 rounded-2xl
        shadow-lg shadow-indigo-500/20
        text-center
      ">
        <h1 className="text-5xl font-bold mb-5">404 - Page Not Found</h1>
        <p className="text-xl mb-8">
          The page you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button 
          type="primary"
          onClick={() => navigate('/dashboard')}
          className="
            bg-[#011936] text-white
            border-none px-8 h-10
            text-base font-medium
            rounded-lg
            shadow-md shadow-[#243954]/30
            hover:bg-[#1d2e45]
          "
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFoundButton;