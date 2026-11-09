const fs = require('fs');
const bundle = fs.readFileSync('dist/assets/index-DUZ4tJB-.js', 'utf8');
console.log('Total bundle size:', bundle.length, 'chars');

const motionPatterns = [
  'animate:',
  'initial:',
  'transition:',
  'exit:',
  'whileHover',
  'whileTap',
  'AnimatePresence',
  'LayoutGroup',
  'MotionConfig',
  'useReducedMotion',
  'useScroll',
  'useTransform',
  'useSpring',
  'motion.div',
  'motion.span',
  'motion.button'
];

for (const p of motionPatterns) {
  const regex = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const matches = bundle.match(regex);
  if (matches) console.log('motion pattern:', p, 'count:', matches.length);
}