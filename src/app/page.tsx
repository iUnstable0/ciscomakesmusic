"use client";

import { useState, useRef } from "react";

// ✨ 1. Import the useSound hook
import useSound from "use-sound";

import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import * as z from "zod";
import { AnimatePresence, motion } from "framer-motion";

import styles from "./page.module.css";

export default function Home() {
  const telRef = useRef<HTMLInputElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const iceCreamRef = useRef<HTMLInputElement | null>(null);

  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showIceCream, setShowIceCream] = useState(false);

  // ✨ 2. Initialize the hook with the path to your sound file
  // The path is relative to the `public` directory.
  const [play] = useSound("/icecream.mp3");

  return (
    <div className={styles.container}>
      <Toaster />

      <div className={styles.content}>
        <Image
          src={"/ciscostudios.gif"}
          alt="Cisco Studios"
          width={400}
          height={400}
          // ✨ 3. Call the play function in the onClick handler
          onClick={() => {
            setShowIceCream(true);
            play();
          }}
          className={styles.record}
          style={{ cursor: "pointer" }}
        />

        <p className={styles.subtext}>
          hi my name is cisco
          <br />
          sign up to get notified about new releases
          <br />
          my email is ciscowallacestudios [at] gmail.com
        </p>

        {/* ... The rest of your component remains the same ... */}
        <motion.div
          key="text-form"
          className={styles.subscribeBox}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AnimatePresence mode="popLayout">
            {subscribed && <p>Thanks for subscribing!</p>}

            {!subscribed && (
              <motion.div
                key={"form"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.2,
                }}
                className={styles.form}
              >
                <div className={styles.inputBox}>
                  <p className={styles.inputLabel}>phone</p>
                  <input
                    type="tel"
                    className={styles.inputField}
                    ref={telRef}
                  />
                </div>

                <div className={styles.inputBox}>
                  <p className={styles.inputLabel}>name</p>
                  <input
                    type="name"
                    className={styles.inputField}
                    ref={nameRef}
                  />
                </div>

                <div className={styles.inputBox}>
                  <p className={styles.inputLabel}>
                    email<span className={styles.asterisk}>*</span>
                  </p>
                  <input
                    type="email"
                    className={styles.inputField}
                    ref={emailRef}
                  />
                </div>

                <AnimatePresence>
                  {showIceCream && (
                    <motion.div
                      key="ice-cream-input"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.3 }}
                      className={styles.inputBox}
                      style={{ overflow: "hidden" }}
                    >
                      <p className={styles.inputLabel}>
                        favorite ice cream flavor
                      </p>
                      <input className={styles.inputField} ref={iceCreamRef} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  disabled={subscribing}
                  className={styles.submitButton}
                  onClick={async () => {
                    if (
                      !emailRef.current ||
                      !telRef.current ||
                      !nameRef.current
                    ) {
                      return;
                    }

                    let email;

                    try {
                      email = z.email().parse(emailRef.current.value);
                    } catch (e) {
                      toast.error("Invalid email address");
                      return;
                    }

                    setSubscribing(true);

                    await toast.promise(
                      axios
                        .request({
                          method: "POST",
                          url: "/api/subscriptions",
                          data: {
                            email: email,
                            phone: telRef.current.value,
                            name: nameRef.current.value,
                            iceCream: iceCreamRef.current?.value || "-",
                          },
                        })
                        .then((response) => {
                          setSubscribed(true);
                          console.log(response.data);
                        })
                        .catch((error) => {
                          console.error(error);
                        })
                        .finally(() => {
                          setSubscribing(false);
                        }),
                      {
                        loading: "Subscribing...",
                        success: "Subscribed successfully!",
                        error: "Subscription failed",
                      },
                    );
                  }}
                >
                  Submit
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
