"use client";

import React from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import PodcastDetailPlayer from "@/components/PodcastDetailPlayer";
import LoaderSpinner from "@/components/LoaderSpinner";
import PodcastCard from "@/components/PodcastCard";
import EmptyState from "@/components/EmptyState";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const PodcastDetails = ({ params: { podcastId } }: { params: { podcastId: Id<'podcasts'> } }) => {

  const podcast = useQuery(api.podcasts.getPodcastById, { podcastId });
  // clerk provide me the current user!
  const { user } = useUser();

  // if this is true, then i am the owner of the podcast !
  const isOwner = user?.id === podcast?.authorId;
  const similarPodcasts = useQuery(api.podcasts.getPodcastBySimilarity, {
    podcastId,
  });


  const lines = podcast?.voicePrompt.trim().split('\n');
  // Initialize variables to store sections
  let intro = '';
  const headings = [];
  const descriptions = [];

  // Current section tracker
  let currentSection = null;

  lines?.forEach(line => {
    if (line.startsWith('Intro:')) {
      currentSection = 'intro';
      intro = line.split(': ')[1];
    } else if (line.startsWith('Heading:')) {
      currentSection = 'heading';
      headings.push(line.split(': ')[1]);
    } else if (line.startsWith('Description:')) {
      currentSection = 'description';
      descriptions.push(line.split(': ')[1]);
    } else {
      if (currentSection === 'heading') {
        headings.push(line);
      } else if (currentSection === 'description') {
        descriptions.push(line);
      }
    }
  });

  console.log("here")
  console.log(similarPodcasts);

  if (!similarPodcasts || !podcast) return <LoaderSpinner />;

  return (
    <section className="flex w-full flex-col">
      <header className="mt-9 flex items-center justify-between">
        <h1 className="text-20 font-bold text-white-1">Currenty Playing</h1>
        <figure className="flex gap-3">
          <Image
            src="/icons/headphone.svg"
            width={24}
            height={24}
            alt="headphone"
          />
          <h2 className="text-16 font-bold text-white-1">{podcast?.views}</h2>
        </figure>
      </header>

      <PodcastDetailPlayer 
      isOwner={isOwner}
      podcastId={podcast._id}
      {...podcast}
      />

      <p className="text-white-2 text-16 pb-8 pt-[45px] font-medium max-md:text-center">
        {podcast?.podcastDescription}
      </p>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-18 font-bold text-white-1">Transcription</h1>
          {/* <p className="text-16 font-medium text-white-2">
            {podcast?.voicePrompt}
          </p> */}
          <h1 className="text-18 font-bold text-white-1">Intro</h1>
          <p className="text-16 font-medium text-white-2">
             {intro}
          </p>
          <h1 className="text-18 font-bold text-white-1">Headings</h1>

          <p className="text-16 font-medium text-white-2">
             {headings}
          </p>
          <h1 className="text-18 font-bold text-white-1">Descriptions</h1>

          <p className="text-16 font-medium text-white-2">
             {descriptions}
          </p>
        </div>
        <div className={`flex flex-col gap-4 ${!podcast.imagePrompt ? 'hidden' : ''}`}>
        <h1 className="text-18 font-bold text-white-1">Thumbnail Prompt</h1>
          <p className="text-16 font-medium text-white-2">
             {podcast?.imagePrompt}
          </p>
        </div>
      </div>


 

      <section className="mt-8 flex flex-col gap-5">
        <h1 className="text-20 font-bold text-white-1">Similar Podcasts</h1>

        {similarPodcasts && similarPodcasts.length > 0 ? (
          <div className="podcast_grid">
            {similarPodcasts?.map(
              ({ _id, podcastTitle, podcastDescription, imageUrl }) => (
                <PodcastCard
                  key={_id}
                  imgUrl={imageUrl as string}
                  title={podcastTitle}
                  description={podcastDescription}
                  podcastId={_id}
                />
              )
            )}
          </div>
        ) : (
          <>
            <EmptyState
              title="No similar podcasts found"
              buttonLink="/discover"
              buttonText="Discover more podcasts"
            />
          </>
        )}
      </section>
    </section>
  );
};

export default PodcastDetails;
