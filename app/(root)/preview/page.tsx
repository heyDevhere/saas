"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import PodcastDetailPlayer from "@/components/PodcastDetailPlayer";
import LoaderSpinner from "@/components/LoaderSpinner";
import { useUser } from "@clerk/nextjs";
import router from "next/router";
import { Button } from "@/components/ui/button";
import { json } from "stream/consumers";
import EmptyState from "@/components/EmptyState";
import { useRouter } from "next/navigation";


const PodcastDetails = () => {
  const [podcast, setPodcast] = useState();
  const { user } = useUser();
  const router = useRouter();

  console.log("dikh ja")
  console.log(user);
    // user: user[0]._id,
  // author: user[0].name,
  // authorId: user[0].clerkId,
  // authorImageUrl: user[0].imageUrl,

  let storedPodcast;
  useEffect(() => {
    // Retrieve podcast data from localStorage
    storedPodcast = localStorage.getItem("podcastData");
    console.log("wow");
    if (storedPodcast) {
      console.log(JSON.parse(storedPodcast));
      console.log(JSON.parse(storedPodcast).podcastTitle);
      const answer = JSON.parse(storedPodcast);
      setPodcast(answer);
      console.log("this is podcast");
      console.log(podcast);
    }
    // console.log(storedPodcast);

    // if (storedPodcast) {
    //   setPodcast(storedPodcast);
    //   console.log(podcast);
    // }
  }, []);

  if (!podcast) return <LoaderSpinner />;

  // Format voice prompt into sections
  const lines = podcast?.voicePrompt?.trim().split("\n") || [];
  let intro = "";
  const headings = [];
  const descriptions = [];
  let currentSection = null;

  lines.forEach((line) => {
    if (line.startsWith("Intro:")) {
      currentSection = "intro";
      intro = line.split(": ")[1];
    } else if (line.startsWith("Heading:")) {
      currentSection = "heading";
      headings.push(line.split(": ")[1]);
    } else if (line.startsWith("Description:")) {
      currentSection = "description";
      descriptions.push(line.split(": ")[1]);
    } else {
      if (currentSection === "heading") {
        headings.push(line);
      } else if (currentSection === "description") {
        descriptions.push(line);
      }
    }
  });

  const handlePreview = () => {
    router.push("/create-podcast");
  };

  return (
    <section className="flex w-full flex-col">
      <header className="mt-9 flex items-center justify-between">
        <h1 className="text-20 font-bold text-white-1">Currently Playing</h1>
        <figure className="flex gap-3">
          <Image
            src="/icons/headphone.svg"
            width={24}
            height={24}
            alt="headphone"
          />
          <h2 className="text-16 font-bold text-white-1">
            {podcast?.views | 0}
          </h2>
        </figure>
      </header>
  

      <PodcastDetailPlayer
        isOwner={false} // Passing false since you don't have the owner information
        podcastId={podcast._id || ""}
        audioUrl={podcast.audioUrl || "https://commondatastorage.googleapis.com/codeskulptor-assets/Collision8-Bit.ogg"}
        podcastTitle={podcast.podcastTitle || ""}
        imageUrl={podcast.imageUrl || "https://www.clipartmax.com/png/middle/447-4473909_cubes-icon-cubes-openshift-route-sample-url.png"}
        author={user?.fullName || ""} // Providing a fallback value
        authorImageUrl={user?.imageUrl || ""} // Providing a fallback value
      /> 
      <p className="text-white-2 text-16 pb-8 pt-[45px] font-medium max-md:text-center">
        {podcast?.podcastDescription}
      </p>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-18 font-bold text-white-1">Transcription</h1>
          <h1 className="text-18 font-bold text-white-1">Intro</h1>
          <p className="text-16 font-medium text-white-2">{intro}</p>
          <h1 className="text-18 font-bold text-white-1">Headings</h1>
          <p className="text-16 font-medium text-white-2">
            {headings.join(", ")}
          </p>
          <h1 className="text-18 font-bold text-white-1">Descriptions</h1>
          <p className="text-16 font-medium text-white-2">
            {descriptions.join(", ")}
          </p>
        </div>
        {podcast.imagePrompt && (
          <div className="flex flex-col gap-4">
            <h1 className="text-18 font-bold text-white-1">Thumbnail Prompt</h1>
            <p className="text-16 font-medium text-white-2">
              {podcast.imagePrompt}
            </p>
          </div>
        )}
      </div>

      <div className="mt-10 w-full">
        <Button
          type="button"
          className="text-16 w-full bg-orange-1 py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1"
          onClick={handlePreview}
        >
          Edit
        </Button>
      </div>

      <section className="mt-8 flex flex-col gap-5">
        <h1 className="text-20 font-bold text-white-1">Similar Podcasts</h1>
        <EmptyState
          title="No similar podcasts found"
          buttonLink="/discover"
          buttonText="Discover more podcasts"
        />
      </section>
    </section>
  );
};

export default PodcastDetails;
