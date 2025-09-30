import { createContext } from "react";

/** 
 * Contains all data related to blocks (content, format, structure). \n
 * Does not include things like selection, focus, etc since does live inside the Editor.
 */


const EditorContext = createContext();

export { EditorContext };