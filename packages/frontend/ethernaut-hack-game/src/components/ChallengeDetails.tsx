import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Tab, Tabs } from "react-bootstrap";
import { loadChallengeContractCode } from "../functions/challengeActions";
import hljs from "highlight.js/lib/core";
import BackButton from "./BackButton";
import "../css/vs2015_dark.css";

type FunctionProps = {
    selectedChallenge: any;
    playerInfo: any[];
    loadingInfo: boolean;
    updatingInstance: boolean;
    loadingCode: boolean;
    setSelectedChallenge: Dispatch<SetStateAction<any>>;
    setLoadingCode: Dispatch<SetStateAction<boolean>>;
    createInstance: (challengeId: string, factoryAddress: string) => void;
    validateSolution: (challengeId: string, instanceAddress: string) => void;
    displayAlert: (type: string, title: string, text: string) => void;
};

function ChallengeDetails({ selectedChallenge, playerInfo, loadingCode, updatingInstance, setSelectedChallenge, setLoadingCode, createInstance, validateSolution, displayAlert }: FunctionProps) {
    const navigate = useNavigate();

    //Placeholders for no selected challenge/challenge player status
    const emptyChallengeObject = { "id": "", "name": "", "factory": "", "description": "", "code": [{ "contractName": "", "filePath": "" }] };
    const emptyChallengePlayerStatusObject = { "challengeId": "", "instanceAddress": "", "solved": false };

    const [selectedChallengeContractsCode, setSelectedChallengeContractsCode] = useState<any[]>([]);
    const [selectedChallengePlayerStatus, setSelectedChallengePlayerStatus] = useState(emptyChallengePlayerStatusObject);

    useEffect(() => {
        const loadCode = async (filePath: string) => {
            return await loadChallengeContractCode(filePath, displayAlert);
        };

        if ("" !== selectedChallenge.id) {
            let loadedCode: any[] = [];
            let promises: any[] = [];

            selectedChallenge.code.forEach((contract: any) => {
                promises.push(loadCode(contract.filePath).then(result => loadedCode.push(result)));
            });

            Promise.all(promises).then(_ => {
                setSelectedChallengeContractsCode(loadedCode);
                setLoadingCode(false);
            });

        } else {
            setLoadingCode(false);
        }
    }, [selectedChallenge]);

    useEffect(() => {
        if (!updatingInstance || "" !== selectedChallenge.id) {
            loadPlayerChallengeProgress(selectedChallenge);
        }
    }, [updatingInstance])

    const handleBackButtonClick = () => {
        setSelectedChallenge(emptyChallengeObject);
        setSelectedChallengePlayerStatus(emptyChallengePlayerStatusObject);
        navigate("/");
    };

    const loadPlayerChallengeProgress = (challenge: any) => {
        let challengeStatus = playerInfo.find(progress => progress.challengeId === challenge.id);
        setSelectedChallengePlayerStatus(undefined !== challengeStatus ? challengeStatus : emptyChallengePlayerStatusObject);
    };

    const renderChallengeDetails = () => {
        const getContractCode = (index: number) => {
            if (!loadingCode) {
                return {
                    __html: hljs.highlight(selectedChallengeContractsCode[index], { language: "solidity" }).value
                }
            }
        }

        return (
            <>
                <div className="challenge-details-header">
                    <div className="d-inline-flex">
                        <BackButton callback={handleBackButtonClick} />
                        <h1 className="margin-left-20">{selectedChallenge.name}</h1>
                    </div>
                    <div className="d-inline-flex">
                        <Button className="margin-right-10" onClick={() => createInstance(selectedChallenge.id, selectedChallenge.factory)} disabled={"" !== selectedChallengePlayerStatus.challengeId}>
                            {
                                <span>Create instance</span>
                            }
                        </Button>
                        <Button onClick={() => validateSolution(selectedChallenge.id, selectedChallengePlayerStatus.instanceAddress)} disabled={"" === selectedChallengePlayerStatus.challengeId || selectedChallengePlayerStatus.solved}>
                            {
                                <span>Validate solution</span>
                            }
                        </Button>
                    </div>
                </div>

                <Tabs id="code-tabs" className="mb-3">
                    {
                        selectedChallenge.code.map((contract: any, index: any) =>
                            <Tab className="contract-tab" key={contract.contractName} eventKey={contract.contractName} title={contract.contractName}>
                                <b className="font-size-18">Address: {"" !== selectedChallengePlayerStatus.challengeId ? selectedChallengePlayerStatus.instanceAddress : "TBD"}</b>
                                <pre className="contract-code-container">
                                    <code className="hljs" dangerouslySetInnerHTML={getContractCode(index)} />
                                </pre>
                            </Tab>
                        )
                    }
                </Tabs>
            </>
        )
    }

    return (
        <div className="challenge-details-panel">
            {renderChallengeDetails()}
        </div>
    );
}

export default ChallengeDetails;