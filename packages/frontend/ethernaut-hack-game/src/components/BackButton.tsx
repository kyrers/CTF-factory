import { MouseEventHandler } from "react";
import { ArrowLeftCircle } from "react-bootstrap-icons";

type FunctionProps = {
    callback: MouseEventHandler<SVGElement>;
};

function BackButton({ callback }: FunctionProps) {
    return (
        <ArrowLeftCircle className="cursor-pointer" size={48} onClick={callback} />
    );
}

export default BackButton;