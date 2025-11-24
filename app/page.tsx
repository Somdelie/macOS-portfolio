import { Dock, Welcome } from "@/components/common";
import gsap from "gsap";
import {Draggable} from "gsap/Draggable";
import { Finder, Resume, Safari, Terminal, Text, ImgFile, Contact } from "@/components/windows/Index";
gsap.registerPlugin(Draggable);



export default function Home() {
  return (
      <main>
         <Welcome />
         <Dock />
         <Contact />
         <Terminal />
         <Safari />
         <Resume />
         <ImgFile />
         <Text />
         <Finder />
      </main>
  );
}
