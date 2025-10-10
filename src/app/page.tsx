"use client";

import { useState, useRef } from "react";

import { Turnstile } from "next-turnstile";

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

  const [verifying, setVerifying] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showIceCream, setShowIceCream] = useState(false);

  const [play] = useSound("/icecream.mp3");

  return (
    <div className={styles.container}>
      <Toaster />

      <AnimatePresence>
        {verifying && (
          <motion.div
            className={styles.captcha}
            initial={{
              transform: "scale(0.95)",
              opacity: 0,
            }}
            animate={{
              transform: "scale(1)",
              opacity: 1,
            }}
            exit={{
              transform: "scale(0.95)",
              opacity: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 20,
              opacity: {
                duration: 0.2,
              },
            }}
            onClick={() => {
              setVerifying(false);
              setSubscribing(false);

              toast.error("Please complete the captcha", { id: "verify" });
            }}
          >
            <div className={styles.captchaCtn}>
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILES_SITE_KEY!}
                onVerify={async (token: string) => {
                  setVerifying(false);
                  toast.success("Verified!", { id: "verify" });

                  let email;

                  try {
                    email = z.email().parse(emailRef.current!.value);
                  } catch (e) {
                    toast.error("Invalid email address");
                    return;
                  }

                  await toast.promise(
                    axios
                      .request({
                        method: "POST",
                        url: "/api/subscriptions",
                        data: {
                          email: email,
                          phone: telRef.current!.value,
                          name: nameRef.current!.value,
                          iceCream: iceCreamRef.current?.value || "-",
                          token: token,
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
                theme="light"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className={styles.content} layout={"position"}>
        <Image
          src={"/ciscostudios.gif"}
          alt="Cisco Studios"
          width={350}
          height={350}
          // ✨ 3. Call the play function in the onClick handler
          onClick={() => {
            setShowIceCream(true);
            play();
          }}
          className={styles.record}
          style={{ cursor: "pointer" }}
        />

        <p className={styles.subtext}>
          hi, my name is cisco
          <br />
          sign up to get notified about new releases!
          <br />
          my email is ciscowallacestudios [at] gmail.com
        </p>

        {/* ... The rest of your component remains the same ... */}
        <motion.div
          key="text-form"
          className={styles.subscribeBox}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, width: showIceCream ? 350 : 300 }}
          transition={{
            duration: 0.2,
            width: {
              type: "spring",
              stiffness: 120,
              damping: 20,
            },
          }}
          layout
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

                <AnimatePresence mode="popLayout">
                  {showIceCream && (
                    <motion.div
                      key="ice-cream-input"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={styles.inputBox}
                      style={{
                        marginTop: "-4px",
                      }}
                    >
                      <motion.p
                        className={styles.inputLabel}
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        transition={{ delay: 0.2, duration: 0.2 }}
                      >
                        favorite ice
                        <br /> cream flavor
                      </motion.p>
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

                    try {
                      z.email().parse(emailRef.current!.value);
                    } catch (e) {
                      toast.error("Invalid email address");
                      return;
                    }

                    setVerifying(true);
                    setSubscribing(true);
                    toast.loading("Verifying...", { id: "verify" });
                  }}
                >
                  Submitf
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
