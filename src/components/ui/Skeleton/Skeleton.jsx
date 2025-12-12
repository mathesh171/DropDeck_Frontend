import styles from './Skeleton.module.css';

const Skeleton = ({ 
  variant = 'text', 
  width, 
  height, 
  circle = false,
  count = 1,
  className = '' 
}) => {
  const skeletons = Array.from({ length: count });

  const getStyle = () => {
    const style = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;
    return style;
  };

  return (
    <>
      {skeletons.map((_, index) => (
        <div
          key={index}
          className={`
            ${styles.skeleton} 
            ${styles[variant]} 
            ${circle ? styles.circle : ''} 
            ${className}
          `}
          style={getStyle()}
        />
      ))}
    </>
  );
};

export default Skeleton;