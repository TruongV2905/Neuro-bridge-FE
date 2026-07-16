import { cn } from "@/lib/utils";
import { Marquee } from "./ui/marquee";

const reviews = [
  {
    name: "Emily Carter",
    username: "@emily",
    body: "The interface feels smooth, easy to use, and more polished than I expected.",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Michael Brown",
    username: "@michael",
    body: "The features work reliably, and the overall experience feels trustworthy.",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Sophia Nguyen",
    username: "@sophia",
    body: "I like how clearly the platform presents information and keeps actions simple.",
    img: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Daniel Lee",
    username: "@daniel",
    body: "The product is practical, saves time, and fits real project needs well.",
    img: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    name: "Olivia Wilson",
    username: "@olivia",
    body: "The design feels modern, the content is clear, and using it feels natural.",
    img: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    name: "James Miller",
    username: "@james",
    body: "I am impressed by the fast interactions and the clean, organized layout.",
    img: "https://randomuser.me/api/portraits/men/51.jpg",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);
const thirdRow = reviews.slice(0, reviews.length / 2);
const fourthRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-fit cursor-pointer overflow-hidden rounded-xl border p-4 sm:w-36",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export function Marquee3D() {
  return (
    <div className="relative flex h-96 w-full flex-row items-center justify-center gap-4 overflow-hidden [perspective:300px]">
      <div
        className="flex flex-row items-center gap-4"
        style={{
          transform:
            "translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)",
        }}
      >
        <Marquee pauseOnHover vertical className="[--duration:20s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:20s]" vertical>
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:20s]" vertical>
          {thirdRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee pauseOnHover className="[--duration:20s]" vertical>
          {fourthRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
      </div>
    </div>
  );
}
