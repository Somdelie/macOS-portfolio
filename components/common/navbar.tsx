'use client'; 
import Image from "next/image";
import { navIcons, navLinks } from "@/constants";
import dayjs from "dayjs";
import useWindowStore from "@/store/window";

const Navbar = () => {
  const {openWindow} = useWindowStore();
  return (
    <nav>
      <div>
        <Image src="/images/logo.svg" width={20} height={20} alt="Logo" />
        <p className=" font-bold">Cautious&apos;s Portfolio</p>
        <ul>
          {navLinks.map(({id,name,type}) => (
            <li key={id} onClick={() => openWindow(type,name)}>
              <p>{name}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <ul>
          {navIcons.map(({ id, img }) => (
            <li key={id}>
              <Image src={img} width={20} height={20} alt={`icon-${id}`} />
            </li>
          ))}
        </ul>
        <time>{dayjs().format("ddd MMM D, h:mm A")}</time>
      </div>
    </nav>
  );
};

export default Navbar;
