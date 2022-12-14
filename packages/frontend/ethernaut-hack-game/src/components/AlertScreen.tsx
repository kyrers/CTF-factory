import { Dispatch, SetStateAction } from "react";
import { Alert } from "react-bootstrap";

type FunctionProps = {
    show: Boolean;
    type: string;
    title: string;
    text: string;
    setShow: Dispatch<SetStateAction<boolean>>;
};


function AlertScreen({ show, type, title, text, setShow }: FunctionProps) {
    return (
        show ?
            <div className="alert-screen">
                <Alert variant={type} onClose={() => setShow(false)} dismissible>
                    <Alert.Heading>{title}</Alert.Heading>
                    <p>
                        {text}
                    </p>
                </Alert>
            </div>
            :
            <></>
    );
}

export default AlertScreen;
