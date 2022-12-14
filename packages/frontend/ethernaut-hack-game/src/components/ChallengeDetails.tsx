import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Tab, Tabs } from "react-bootstrap";
import { loadChallengeContractCode } from "../functions/challengeActions";
import { storeSelectedChallenge } from "../functions/playerActions";
import hljs from "highlight.js/lib/core";
import BackButton from "./BackButton";
import "../css/vs2015_dark.css";

type FunctionProps = {
    selectedChallenge: any;
    playerInfo: any[];
    loadingInfo: boolean;
    updatingInstance: boolean;
    loadingCode: boolean;
    setSelectedChallenge: Dispatch<SetStateAction<any>>
    setLoadingCode: Dispatch<SetStateAction<boolean>>;
    createInstance: (challengeId: number, factoryAddress: string) => void;
    validateSolution: (challengeId: number, instanceAddress: string) => void;
    displayAlert: (type: string, title: string, text: string) => void;
};

function ChallengeDetails({ selectedChallenge, playerInfo, loadingCode, updatingInstance, setSelectedChallenge, setLoadingCode, createInstance, validateSolution, displayAlert }: FunctionProps) {
    const navigate = useNavigate();

    //Placeholders for no selected challenge/challenge player status
    const emptyChallengeObject = { "id": 0, "name": "", "factory": "", "description": "", "code": [{ "contractName": "", "filePath": "" }] };
    const emptyChallengePlayerStatusObject = { "challengeId": 0, "instanceAddress": "", "solved": false, "extra": [] };

    const [selectedChallengeContractsCode, setSelectedChallengeContractsCode] = useState<Map<string, any>>();
    const [selectedChallengePlayerStatus, setSelectedChallengePlayerStatus] = useState(emptyChallengePlayerStatusObject);

    useEffect(() => {
        const loadCode = async (filePath: string) => {
            return await loadChallengeContractCode(filePath, displayAlert);
        };

        if ("" !== selectedChallenge.id) {
            let loadedCode = new Map<string, any>();
            let promises: any[] = [];

            selectedChallenge.code.forEach((contract: any) => {
                promises.push(loadCode(contract.filePath).then(result => loadedCode.set(contract.contractName, result)));
            });

            Promise.all(promises).then(_ => {
                setSelectedChallengeContractsCode(loadedCode);
                setLoadingCode(false);
            });

        } else {
            setLoadingCode(false);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChallenge]);

    useEffect(() => {
        if (!updatingInstance || "" !== selectedChallenge.id) {
            loadPlayerChallengeProgress(selectedChallenge);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updatingInstance])

    useEffect(() => {
        if (!updatingInstance || "" !== selectedChallenge.id) {
            loadPlayerChallengeProgress(selectedChallenge);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playerInfo])

    const handleBackButtonClick = () => {
        setSelectedChallenge(emptyChallengeObject);
        setSelectedChallengePlayerStatus(emptyChallengePlayerStatusObject);
        storeSelectedChallenge(emptyChallengeObject);
        navigate("/");
    };

    const loadPlayerChallengeProgress = (challenge: any) => {
        if (null !== playerInfo) {
            let challengeStatus = playerInfo.find(progress => progress.challengeId === challenge.id);
            setSelectedChallengePlayerStatus(undefined !== challengeStatus ? challengeStatus : emptyChallengePlayerStatusObject);
        }
    };

    const renderChallengeDetails = () => {
        const getContractCode = (contractName: string) => {
            if (!loadingCode) {
                return {
                    __html: hljs.highlight(selectedChallengeContractsCode?.get(contractName), { language: "solidity" }).value
                }
            }
        }

        return (
            <>
                <div className="challenge-details-header">
                    <div className="d-inline-flex flex-column text-align-initial">
                        <div className="d-inline-flex">
                            <BackButton callback={handleBackButtonClick} />
                            <h1 className="margin-left-20">{selectedChallenge.name}</h1>
                        </div>
                        <h4 className="challenge-details-contract-info"><b>Address: {0 !== selectedChallengePlayerStatus.challengeId ? selectedChallengePlayerStatus.instanceAddress : "TBD"}</b></h4>
                        {
                            selectedChallengePlayerStatus.extra.map((detail: any) =>
                                <h5 className="challenge-details-contract-info" key={detail.key}>{detail.key}: {detail.value}</h5>
                            )
                        }
                    </div>
                    <div className="controller-buttons">
                        <Button className="create-instance-button" onClick={() => createInstance(selectedChallenge.id, selectedChallenge.factory)} disabled={0 !== selectedChallengePlayerStatus.challengeId}>
                            {
                                <span>Create instance</span>
                            }
                        </Button>
                        <Button onClick={() => validateSolution(selectedChallenge.id, selectedChallengePlayerStatus.instanceAddress)} disabled={0 === selectedChallengePlayerStatus.challengeId || selectedChallengePlayerStatus.solved}>
                            {
                                <span>Validate solution</span>
                            }
                        </Button>
                    </div>
                </div>

                <Tabs id="code-tabs" className="mb-3">
                    {
                        selectedChallenge.code.map((contract: any) =>
                            <Tab className="contract-tab" key={contract.contractName} eventKey={contract.contractName} title={contract.contractName}>
                                <pre className="contract-code-container">
                                    <code className="hljs" dangerouslySetInnerHTML={getContractCode(contract.contractName)} />
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
