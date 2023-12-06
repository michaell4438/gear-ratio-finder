import {FC, Fragment, ReactElement} from "react";

interface Props {
  title: string;
  subtitle: string;
}

export const DividedHeader: FC<Props> = ({ title, subtitle }): ReactElement => {
  return <Fragment>
      <div className={"w-full mr-auto ml-4"}>
        <h1 className={"pl-8 text-4xl mt-8 text-green-400"}>{title}</h1>
        <div className={"h-[0.375rem] bg-green-600 w-full my-4"}/>
        <p className={"pl-8 text-green-200"}>
          {subtitle}
        </p>
      </div>
    </Fragment>
}