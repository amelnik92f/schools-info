import { Card, CardBody } from "@heroui/card";

import { title } from "@/components/primitives";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <h1 className={title({ size: "lg" })}>About</h1>
        <p className="text-lg text-default-500 mt-4">
          Making school search in Berlin easier
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card className="bg-content1 shadow-medium">
          <CardBody className="gap-4 p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <span className="text-2xl">🏫</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                The Project
              </h2>
            </div>
            <p className="text-base text-default-700 leading-relaxed">
              Schools Info is an aggregator of schools in Berlin, designed to
              simplify the search for the right school for your child. Finding a
              suitable school can be overwhelming with so many options across
              the city. This platform brings together comprehensive information
              about Berlin schools in one place, making it easier for parents to
              compare and discover educational institutions that match their
              needs.
            </p>
          </CardBody>
        </Card>

        <Card className="bg-content1 shadow-medium">
          <CardBody className="gap-4 p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <span className="text-2xl">👨‍💻</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">About Me</h2>
            </div>
            <p className="text-base text-default-700 leading-relaxed">
              I'm a software engineer based in Berlin, passionate about creating
              tools that solve real-world problems and help make everyday
              decisions easier for people in the community.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
