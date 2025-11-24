import { Desktop, Dock, Welcome, Widgets, WindowHydrator } from "@/components/common";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import {
  Finder,
  Resume,
  Safari,
  Terminal,
  Text,
  ImgFile,
  Contact,
  Photos,
  Archive,
  Music,
} from "@/components/windows/Index";
gsap.registerPlugin(Draggable);

export default function Home() {
  return (
    <main>
      <WindowHydrator />
      <Welcome />
      <Dock />
      <Widgets />
      <Contact />
      <Terminal />
      <Safari />
      <Resume />
      <ImgFile />
      <Photos />
      <Archive />
      <Music />
      <Text />
      <Finder />
      <Desktop />
    </main>
  );
}
