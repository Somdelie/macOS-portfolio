/* eslint-disable @next/next/no-img-element */

"use client";
import WindowWrapper from "@/hoc/WindowWrapper";
import WindowControlls from "../common/WindowControlls";
import { socials } from "@/constants";

const Contact = () => {
  return (
    <>
      <div id="window-header">
        <WindowControlls target="contact" />
        <h2>Contact</h2>
      </div>
      <div className="p-5 space-y-5">
        <img
          src="/images/cautie7.jpg"
          alt="contact"
          className="w-20 h-20 rounded-full"
        />
        <h3>Let&apos;s get in touch</h3>
        <p>
          Got an idea? A bug to squash ? Just wanna talk tech? I&apos;m ready to
          chat.
        </p>
        <p>admin@cautiousndlovu.co.za</p>
        <ul>
          {socials?.map(({ id, text, icon, link, bg }) => (
            <li key={id} style={{ backgroundColor: bg }}>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                title={text}
              >
                <img src={icon} alt={text} className="size-5" />
                <p>{text}</p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

const ContactWindow = WindowWrapper(Contact, "contact");

export default ContactWindow;
