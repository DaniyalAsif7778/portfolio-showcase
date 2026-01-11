import { motion } from 'framer-motion';

interface SkillCircleProps {
  name: string;
  percentage: number;
  color: string;
  delay?: number;
}

const SkillCircle = ({ name, percentage, color, delay = 0 }: SkillCircleProps) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke="hsl(var(--secondary))"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <motion.circle
            cx="56"
            cy="56"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset }}
            transition={{ duration: 1.5, delay: delay + 0.3, ease: 'easeOut' }}
            viewport={{ once: true }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.8 }}
            viewport={{ once: true }}
            className="text-xl font-bold font-display"
          >
            {percentage}%
          </motion.span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{name}</span>
    </motion.div>
  );
};

export default SkillCircle;
