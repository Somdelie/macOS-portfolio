/* eslint-disable @next/next/no-img-element */
"use client";
import { locations } from "@/constants";
import { useGSAP } from "@gsap/react";
import clsx from "clsx";
import { Draggable } from "gsap/Draggable";
import useWindowStore from "@/store/window";
import useLocationStore from "@/store/location";

const projects = locations.work?.children ?? [];

const Desktop = () => {
  const { setActiveLocation } = useLocationStore();
  const { openWindow } = useWindowStore();

  const handleOpenProjectFinder = (project: unknown) => {
    openWindow("finder", project);
    setActiveLocation(project);
      };

  useGSAP(() => {
    Draggable.create(".folder");
  }, []);

  return (
    <section id="home">
      <ul>
        {projects.map((item) => (
          <li
            key={item.id}
            className={clsx("group folder", item?.position)}
            onClick={() => handleOpenProjectFinder(item)}
          >
            <img src={item.icon} alt={item.name} />
            <p>{item.name}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Desktop;
