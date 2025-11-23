import { Dock, Welcome } from "@/components/common";
import gsap from "gsap";
import {Draggable} from "gsap/Draggable";
import { Finder, Resume, Safari, Terminal } from "@/components/windows/Index";
gsap.registerPlugin(Draggable);



export default function Home() {
  return (
      <main>
         <Welcome />
         <Dock />
         <Terminal />
         <Safari />
         <Resume />
         <Finder />
      </main>
  );
}
