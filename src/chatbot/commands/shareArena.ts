import { active, code, password } from "../../../sens/arena-right-now.json";

export default (): string => {
    if (!active) return `Sorry, no public arena right now!`;
    return `Join me in the arena! Code: ${code}; Password: ${password}`;
};