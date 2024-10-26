"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import GenerateThumbnail from "@/components/GenerateThumbnail";
import GeneratePodcast from "@/components/GeneratePodcast";
import { Loader } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  podcastTitle: z.string().min(2),
  podcastDescription: z.string().min(2),
});

// const voiceCategories = ["alloy", "shimmer", "nova", "echo", "fable", "onyx"];



const CreatePodcast = () => {
  const router = useRouter();
  // const [voiceType, setVoiceType] = useState<string | null>(null);
  const [headings, setHeadings] = useState<string[]>([""]); // Array of headings
  const [descriptions, setDescriptions] = useState<string[]>([""]); // Array of descriptions
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isAiThumbnail, setIsAiThumbnail] = useState(false);
  const [intro, setIntro] = useState("");
  const [podcastDescription, setPodcastDescription] = useState("");
  const { toast } = useToast();
  const handleGenerateDesc = useAction(api.voicerss.analyzeImageAction);
  const createPodcast = useMutation(api.podcasts.createPodcast);

  const addHeading = (e:event) => {
    e.preventDefault();
    setHeadings([...headings, ""]);
  };
  const removeHeading = (index: number,e:event) => {
    e.preventDefault();
    if (headings.length === 1) return;
    setHeadings(headings.filter((_, i) => i !== index));
  };

  const addDescription = (e:event) => {
    e.preventDefault();
    setDescriptions([...descriptions, ""]);
  };
  const removeDescription = (index: number,e:event) => {
    e.preventDefault();
    if (descriptions.length === 1) return; // Prevent removal if only one item is present
    setDescriptions(descriptions.filter((_, i) => i !== index));
  };

  const handleHeadingChange = (index: number, value: string) => {
    const updatedHeadings = [...headings];
    updatedHeadings[index] = value;
    setHeadings(updatedHeadings);
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updatedDescriptions = [...descriptions];
    updatedDescriptions[index] = value;
    setDescriptions(updatedDescriptions);
  };

  // This id is coming from the covex schema ! , we are calling it via _stoage....and this id coming from the convex schema can be null also !!
  const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(
    null
  );

  const [audioUrl, setAudioUrl] = useState("");


  
  const [imageUrl, setImageUrl] = useState("");

  // how many seconds is the audio
  const [audioDuration, setAudioDuration] = useState(0);

  const [voicePrompt, setVoicePrompt] = useState("");

  useEffect(() => {
    setVoicePrompt(
      `Intro: ${intro}\nHeading: ${headings.join("\n")}\nDescription: ${descriptions.join("\n")}`
    );
    console.log(voicePrompt);
  }, [intro, headings, descriptions]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      podcastTitle: "",
      podcastDescription: "",
    },
  });


  useEffect(() => {
    const storedPodcastData = localStorage.getItem("podcastData");
    if (storedPodcastData) {
      const podcastData = JSON.parse(storedPodcastData);
      // Set the initial values in the form
      form.reset({
        podcastTitle: podcastData.podcastTitle || "",
        podcastDescription: podcastData.podcastDescription || "",
      });
      setIntro(podcastData.intro || "");
      setHeadings(podcastData.headings || [""]);
      setDescriptions(podcastData.descriptions || [""]);
      setAudioUrl(podcastData.audioUrl || "");
      setImageUrl(podcastData.imageUrl || "");
      setAudioDuration(podcastData.audioDuration || 0);
    }
  }, [form]);
  
  

  // 2. Define a submit handler.
  async function onSubmit(data: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(data);

    try {
      setIsSubmitting(true);
      if (!audioUrl || !imageUrl) {
        toast({
          title: "Please generate audio and image",
        });
        setIsSubmitting(false);
        throw new Error("Please generate audio and image");
      }

      const podcast = await createPodcast({
        podcastTitle: data.podcastTitle,
        podcastDescription: data.podcastDescription,
        audioUrl,
        imageUrl,
        imagePrompt,
        voicePrompt,
        views: 0,
        audioDuration,
        audioStorageId: audioStorageId!,
        imageStorageId: imageStorageId!,
      });
      toast({ title: "Podcast Created" });
      setIsSubmitting(false);
      router.push("/");
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  }

  const generateDesc = async () => {
    try {
      if (imageUrl) {
        setIsAiThumbnail(true);
        const response = await handleGenerateDesc({ imageUrl: imageUrl });
        form.setValue("podcastDescription", response);
        toast({
          title: "Description Generated Successfully!",
        });
        setIsAiThumbnail(false);
      } else {
        toast({
          title: "Upload Thumbnail First",
        });
      }
    } catch (error) {
      toast({
        title: "Error generating Description",
      });
    }
  };


  const handlePreview = () => {
    try {
      const podcastData = {
        podcastTitle: form.getValues("podcastTitle"),
        podcastDescription: form.getValues("podcastDescription"),
        intro,
        headings,
        descriptions,
        audioUrl,
        imageUrl,
        imagePrompt,
        voicePrompt,
        audioDuration,
      };
  
      // Serialize podcast data to JSON
      const podcastDataString = JSON.stringify(podcastData);
  
      // Ensure the size is within localStorage limits (approx. 5-10MB across browsers)
      if (podcastDataString.length > 5 * 1024 * 1024) {
        toast({
          title: "Podcast data too large to preview",
          variant: "destructive",
        });
        return;
      }
  
      // Save podcast data to localStorage
      localStorage.setItem("podcastData", podcastDataString);
  
      // Redirect to preview page
      router.push("/preview");
    } catch (error) {
      console.error("Error saving podcast data to localStorage:", error);
      toast({
        title: "Error saving podcast data",
        variant: "destructive",
      });
    }
  };
  

  return (
    <section className="mt-10 flex flex-col">
      <h1 className="text-20 font-bold text-white-1">Create Podcast</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-12 flex w-full flex-col"
        >
          <div className="flex flex-col gap-[30px] border-b border-black-5 pb-10">
            <FormField
              control={form.control}
              name="podcastTitle"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5  focus-visible:ring-offset-orange-1">
                  <FormLabel className="text-16 font-bold text-white-1">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="input-class focus-visible:ring-offset-orange-1"
                      placeholder="Dev Pro Podcast"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />

            {/* <div className="flex flex-col gap-2.5">
              <Label className="text-16 font-bold text-white-1">
                Select AI Voice
              </Label>
              {/* i added className=relative to make the select drop ! , to be down ! */}
            {/* <Select onValueChange={(value) => setVoiceType(value)}>
                <SelectTrigger
                  className={cn(
                    "text-16 w-full border-none bg-black-1 text-gray-1 focus-visible:ring-offset-orange-1"
                  )}
                >
                  <SelectValue
                    placeholder="Select AI Voice"
                    className="placeholder:text-gray-1 "
                  />
                </SelectTrigger> */}
            {/* position absolute as the , RA , above is position relative ! */}
            {/* <SelectContent className="absolute  text-16 border-none bg-black-1 font-bold text-white-1  focus-visible:ring-offset-orange-1">
                  {voiceCategories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="capitalize focus:bg-orange-1"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
                {voiceType && (
                  <audio
                    src={`/${voiceType}.mp3`}
                    autoPlay
                    className="hidden"
                  />
                )}
              </Select> */}
            {/* </div>  */}

            <div className="flex flex-col pt-1">
              <GenerateThumbnail
                setImage={setImageUrl}
                setImageStorageId={setImageStorageId}
                image={imageUrl}
                imagePrompt={imagePrompt}
                setImagePrompt={setImagePrompt}
              />
            </div>

            <FormField
              control={form.control}
              name="podcastDescription"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <div className="generate_thumbnail">
                    <Button
                      type="button"
                      variant="plain"
                      onClick={generateDesc}
                      className={cn("", {
                        "bg-black-6": isAiThumbnail,
                      })}
                    >
                      {isAiThumbnail ? (
                        <>
                          Generating
                          <Loader size={20} className="animate-spin ml-2" />
                        </>
                      ) : (
                        "Use AI to generate Podcast Description"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="plain"
                      onClick={() => setIsAiThumbnail(false)}
                      className={cn("ml-2", {
                        "bg-black-6": !isAiThumbnail,
                      })}
                    >
                      Write Description Manually
                    </Button>
                  </div>

                  <FormLabel className="text-16 font-bold text-white-1">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="input-class focus-visible:ring-offset-orange-1"
                      placeholder="Write a Short Podcast Description"
                      {...field}
                      value={field.value} // Ensure the field value is controlled
                      onChange={(e) =>
                        form.setValue("podcastDescription", e.target.value)
                      }
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />
          </div>

          <FormItem className="mt-3 flex flex-col gap-2.5 focus-visible:ring-offset-orange-1">
            <div className="flex flex-col gap-2.5">
              <FormLabel className="mt-1 text-16 font-bold text-white-1">
                Intro
              </FormLabel>
              <FormControl>
                <Input
                  className="input-class focus-visible:ring-offset-orange-1"
                  placeholder="Intro of the podcast"
                  onChange={(e) => setIntro(e.target.value)}
                />
              </FormControl>
              <FormMessage className="text-white-1" />
            </div>
          </FormItem>

          <FormItem className="mt-3 flex flex-col gap-2.5 focus-visible:ring-offset-orange-1">
            {headings.map((heading, index) => (
              <div key={index} className="flex flex-col gap-2.5">
                <FormLabel className="mt-1 text-16 font-bold text-white-1">
                  heading {index + 1}
                </FormLabel>
                <FormControl>
                  <Input
                    value={heading}
                    className="input-class focus-visible:ring-offset-orange-1"
                    placeholder="Intro of the podcast"
                    onChange={(e) => handleHeadingChange(index, e.target.value)}
                  />
                </FormControl>
                <FormMessage className="text-white-1" />
                <div>
                  <Button
                    className="text-16 m-3 bg-orange-1 py-4 font-bold text-white-1"
                    variant="outline"
                    onClick={(e) => removeHeading(index,e)}
                  >
                    Remove
                  </Button>
                  <Button
                    className="text-16 bg-orange-1 py-4 font-bold text-white-1"
                    onClick={addHeading}
                  >
                    Add Heading
                  </Button>
                </div>
              </div>
            ))}
          </FormItem>

          <FormItem className="mt-3 flex flex-col gap-2.5 focus-visible:ring-offset-orange-1">
            {descriptions.map((desc, index) => (
              <div key={index} className="flex flex-col gap-2.5">
                <FormLabel className="mt-1 text-16 font-bold text-white-1">
                  Description {index + 1}
                </FormLabel>
                <FormControl>
                  <Input
                    value={desc}
                    className="input-class focus-visible:ring-offset-orange-1"
                    placeholder="Desc of the podcast"
                    onChange={(e) =>
                      handleDescriptionChange(index, e.target.value)
                    }
                  />
                </FormControl>
                <FormMessage className="text-white-1" />
                <div>
                  <Button
                    className="text-16 m-3 bg-orange-1 py-4 font-bold text-white-1"
                    variant="outline"
                    onClick={(e) => removeDescription(index,e)}
                  >
                    Remove
                  </Button>
                  <Button
                    className="text-16 bg-orange-1 py-4 font-bold text-white-1"
                    onClick={addDescription}
                  >
                    Add Description
                  </Button>
                </div>
              </div>
            ))}
          </FormItem>

          <div className="flex flex-col pt-1">
            {/* <GenerateThumbnail 
              setImage={setImageUrl}
              setImageStorageId={setImageStorageId}
              image={imageUrl}
              imagePrompt={imagePrompt}
              setImagePrompt={setImagePrompt}
              /> */}

            <GeneratePodcast
              setAudioStorageId={setAudioStorageId}
              setAudio={setAudioUrl}
              // voiceType={voiceType!}
              audio={audioUrl}
              voicePrompt={voicePrompt}
              setVoicePrompt={setVoicePrompt}
              setAudioDuration={setAudioDuration}
              image={imageUrl}
            />

            <div className="mt-10 w-full">
              <Button
                type="submit"
                className="text-16 w-full bg-orange-1 py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1"
              >
                {isSubmitting ? (
                  <>
                    Submitting
                    <Loader size={20} className="animate-spin ml-2" />
                  </>
                ) : (
                  "Submit & Publish Podcast"
                )}
              </Button>
            </div>

            <div className="mt-10 w-full">
              <Button
                type="button"
                className="text-16 w-full bg-orange-1 py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1"
                onClick={handlePreview} 
              >
                Preview
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default CreatePodcast;
