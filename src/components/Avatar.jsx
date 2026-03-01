import { hashColor } from "../utils/format.js";

export const Avatar = ({ name }) => {
  const bg = hashColor(name);
  const letter = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center text-sm font-semibold text-white`}>
      {letter}
    </div>
  );
};
