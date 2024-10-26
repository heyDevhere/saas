import React from 'react'
import Image from 'next/image'
import { PodcastCardProps } from '@/types'
import { useRouter } from 'next/navigation';

function PodcastCard({
    imgUrl,
    title,
    description,
    podcastId
}:PodcastCardProps) {
  const router = useRouter();
  
  const handleViews = () => {
    // increase views
    router.push(`/podcast/${podcastId}`,{
      // this will scroll to the top of the page !!
      scroll:true
    })
  }
  return (
    <div className="cursor-pointer" onClick={handleViews} >
      <figure className="flex flex-col gap-2">
        <Image 
          src={imgUrl}
          width={174}
          height={174}
          alt={title}
        //   here it was written width full
        //   className="aspect-square h-fit w-full rounded-xl 2xl:size-[200px]"
          className="aspect-square h-fit  rounded-xl 2xl:size-[200px]"

        />
        <div className="flex flex-col w-[174px] 2xl:w-[200px]">
        <h1 className="text-16 truncate font-bold text-white-1">{title}</h1>
          <h2 className="text-12 truncate font-normal capitalize text-white-4">{description}</h2>
        </div>
      </figure>
    </div>
  )
}

export default PodcastCard
