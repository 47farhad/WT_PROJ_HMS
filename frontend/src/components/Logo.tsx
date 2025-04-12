const Logo = ({ size = 40 }) => {
    return (
      <div 
        className="relative" 
        style={{ 
          width: `${size}px`, 
          height: `${size}px` 
        }}
      >
        
        {/* Vertical bar of the cross */}
        <div 
          className="absolute left-1/2 transform -translate-x-1/2"
          style={{
            width: `${size * 0.23}px`,
            height: `${size}px`,
            backgroundColor: "#243954",
            borderRadius: "4px",
            zIndex: 2
          }}
        />
        
        {/* Horizontal bar of the cross */}
        <div 
          className="absolute top-1/2 transform -translate-y-1/2"
          style={{
            width: `${size}px`,
            height: `${size * 0.23}px`,
            backgroundColor: "#243954",
            borderRadius: "4px",
            zIndex: 2
          }}
        />
      </div>
    );
  };
  
  export default Logo;