import React, { useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as v from "valibot";
import { FormInput } from "../FormInput";
import { ResponsiveLayout } from "../ResponsiveLayout";
import * as forge from "node-forge";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Stepper } from "../Stepper";
import useCurrentLanguage from "../../hooks/useCurrentLanguage";
import { ThreeStateCard } from "../ThreeSateCard";

const translationsObject = {
  en: {
    chooseOption: "Choose Option",
    brainwallet: "Brainwallet Key",
    certificateFile: "Certificate File",
    passphrase: "Passphrase",
    passphraseWords: "Passphrase words*",
    wordPlaceholder: "Word",
    uploadPrivateKey: "Select Private Key",
    privateKeyPassword: "Private Key Password",
    fileHash: "File Hash",
    password: "Password",
    signedHash: "Signed Hash",
    enterPassphrase: "Enter your passphrase",
    enterPassword: "Enter your password",
    enterFileHash: "Enter the file hash",
    stepTitles: {
      choose: "Choose Option",
      brainwalletPassphrase: "Enter Passphrase",
      brainwalletPassword: "Enter Password",
      certificateFile: "Upload Certificate",
      privateKeyPassword: "Enter Certificate Password",
      fileHash: "Enter File Hash",
      result: "View Signed Hash",
    },
    stepDescriptions: {
      choose: "Choose whether to use a Brainwallet or a Certificate File.",
      brainwalletPassphrase: "Enter your Brainwallet passphrase.",
      brainwalletPassword: "Enter your password.",
      certificateFile: "Upload your certificate file.",
      privateKeyPassword: "Enter the password for your certificate file.",
      fileHash: "Enter the file hash to sign.",
      result: "View and download your signed hash.",
    },
    invalidPassword: "Invalid password.",
    failedToSign: "Failed to sign document.",
    buttonBack: "Back",
    buttonNext: "Next",
    errors: {
      noPrivateKeyFound: "No private key found in the PKCS#12 file.",
      notAnRsaPrivateKey: "The key is not an RSA private key.",
    },
    stepsLabels: {
      choose: "Select Signature Type",
      brainwalletPassphrase: "Enter Passphrase",
      certificateFile: "Select Signature File",
      privateKeyPassword: "Enter Signature Password",
      fileHash: "Copy Document ID",
      result: "Link Proof of Signature",
    },
    brainWalletDescription: (
      <>
        Sign your document using a <b>Brain Wallet</b>, where your signature is generated from a
        passphrase stored only in your memory. This method ensures maximum security and flexibility,
        allowing you to sign documents without needing any stored files on your device.
      </>
    ),
    locallyStoredSignatureDescription: (
      <>
        Sign your document using a <b>Locally Stored Signature</b>, where your electronic signature
        file is securely saved on your USB stick or laptop. This option provides fast access and is
        ideal for users who have their signature readily available on their device.
      </>
    ),
    stepsSecondaryContent: {
      choose: {
        title: "Choose Your Signature Type",
        description:
          "To sign your document, start by selecting the type of electronic signature you wish to use. Please note, you need to already have one of these electronic signatures — either a Brain Wallet or a Locally Stored Signature — set up. Choose between using a Brain Wallet, which is secured by a passphrase, or a Locally Stored Signature, which is stored on your device.",
      },
      brainwalletPassphrase: {
        title: "Input Your 12-Word Passphrase",
        description:
          "To sign your document using a Brain Wallet, enter the 12-word passphrase in the exact order you used to generate your electronic signature. This step is crucial for accurately recreating your signature and ensuring it matches your original Brain Wallet setup. Make sure to input the words correctly and in the same sequence.",
      },
      fileHash: {
        title: "Retrieve Your Document ID",
        description:
          "To proceed with signing, copy the Document ID from the Gov-Smart platform. This unique identifier links your electronic signature to the specific document you intend to sign, ensuring the correct and secure association. Make sure to copy the ID accurately, as it's essential for the signing process.",
      },
      result: {
        title: "Finalize Your Document Signing",
        description:
          "To complete the signing process, link the proof of your signature with the Gov-Smart platform. This step confirms that your electronic signature has been successfully applied to the document. By submitting this proof, you ensure that the document is securely signed and recognized within the Gov-Smart system. Make sure to follow the prompts to finalize and secure your transaction.",
      },
      certificateFile: {
        title: "Choose Your Electronic Signature File",
        description:
          "To sign your document, select the electronic signature file stored on your USB stick or laptop. This file contains your digital signature, which will be applied to the document. Ensure you choose the correct file to proceed with the signing process. Once selected, upload the file to continue.",
      },
      privateKeyPassword: {
        title: "Decrypt Your Electronic Signature",
        description:
          "To proceed with signing the document, enter the password you created to encrypt your electronic signature. This password is required to decrypt your signature file, ensuring that only you can apply it to documents. Make sure to input the correct password to unlock and use your digital signature securely.",
      },
    },
  },
  ro: {
    chooseOption: "Alegeți Opțiunea",
    brainwallet: "Cheie Brainwallet",
    certificateFile: "Fișier Certificat",
    passphrase: "Fraza de acces",
    passphraseWords: "Cuvinte parolă*",
    wordPlaceholder: "Cuvânt",
    uploadPrivateKey: "Selectați Cheia Privată",
    privateKeyPassword: "Parola Cheii Private",
    fileHash: "Hash-ul Fișierului",
    password: "Parola",
    signedHash: "Hash-ul Semnat",
    enterPassphrase: "Introduceți fraza de acces",
    enterPassword: "Introduceți parola",
    enterFileHash: "Introduceți hash-ul fișierului",
    stepTitles: {
      choose: "Alegeți Opțiunea",
      brainwalletPassphrase: "Introduceți Fraza de Acces",
      brainwalletPassword: "Introduceți Parola",
      certificateFile: "Încărcați Certificatul",
      privateKeyPassword: "Introduceți Parola Certificatului",
      fileHash: "Introduceți Hash-ul Fișierului",
      result: "Vizualizați Hash-ul Semnat",
    },
    stepDescriptions: {
      choose: "Alegeți dacă doriți să utilizați un Brainwallet sau un fișier certificat.",
      brainwalletPassphrase: "Introduceți fraza dvs. de acces Brainwallet.",
      brainwalletPassword: "Introduceți parola dvs.",
      certificateFile: "Încărcați fișierul certificat.",
      privateKeyPassword: "Introduceți parola pentru fișierul certificat.",
      fileHash: "Introduceți hash-ul fișierului pentru semnare.",
      result: "Vizualizați și descărcați hash-ul semnat.",
    },
    invalidPassword: "Parolă invalidă.",
    failedToSign: "Eșec la semnarea documentului.",
    buttonBack: "Înapoi",
    buttonNext: "Următorul",
    errors: {
      noPrivateKeyFound: "Nu a fost găsită nicio cheie privată în fișierul PKCS#12.",
      notAnRsaPrivateKey: "Cheia nu este o cheie privată RSA.",
    },
    stepsLabels: {
      choose: "Selectați Tipul de Semnătură",
      brainwalletPassphrase: "Introduceți Parola",
      certificateFile: "Selectați Fișierul de Semnătură",
      privateKeyPassword: "Introduceți Parola Semnăturii",
      fileHash: "Copiați ID-ul Documentului",
      result: "Link Proba Semnăturii",
    },
    brainWalletDescription: (
      <>
        Semnați documentul folosind un <b>Brain Wallet</b>, unde semnătura este generată dintr-o
        parolă stocată doar în memoria dumneavoastră. Această metodă asigură securitate maximă și
        flexibilitate, permițându-vă să semnați documente fără a avea nevoie de fișiere stocate pe
        dispozitiv.
      </>
    ),
    locallyStoredSignatureDescription: (
      <>
        Semnați documentul folosind o <b>Semnătură Stocată Local</b>, unde fișierul cu semnătura
        electronică este salvat în siguranță pe stick-ul USB sau pe laptop. Această opțiune oferă
        acces rapid și este ideală pentru utilizatorii care au semnătura disponibilă pe dispozitiv.
      </>
    ),
    stepsSecondaryContent: {
      choose: {
        title: "Alegeți Tipul de Semnătură",
        description:
          "Pentru a semna documentul, începeți prin a selecta tipul de semnătură electronică pe care doriți să o utilizați. Vă rugăm să rețineți că trebuie să aveți deja configurată una dintre aceste semnături electronice - fie un Brain Wallet, fie o Semnătură Stocată Local. Alegeți între utilizarea unui Brain Wallet, care este securizat printr-o parolă, sau a unei Semnături Stocate Local, care este stocată pe dispozitiv.",
      },
      brainwalletPassphrase: {
        title: "Introduceți Parola de 12 Cuvinte",
        description:
          "Pentru a semna documentul folosind un Brain Wallet, introduceți parola de 12 cuvinte în ordinea exactă în care a fost utilizată pentru a genera semnătura electronică. Acest pas este crucial pentru a recrea corect semnătura și pentru a vă asigura că aceasta corespunde configurării originale a Brain Wallet. Asigurați-vă că introduceți cuvintele corect și în aceeași secvență.",
      },
      fileHash: {
        title: "Recuperați ID-ul Documentului",
        description:
          "Pentru a continua cu semnarea, copiați ID-ul Documentului de pe platforma Gov-Smart. Acest identificator unic leagă semnătura electronică de documentul specific pe care intenționați să îl semnați, asigurând asocierea corectă și sigură. Asigurați-vă că copiați corect ID-ul, deoarece este esențial pentru procesul de semnare.",
      },
      result: {
        title: "Finalizați Semnarea Documentului",
        description:
          "Pentru a finaliza procesul de semnare, legați proba semnăturii cu platforma Gov-Smart. Acest pas confirmă că semnătura electronică a fost aplicată cu succes pe document. Prin trimiterea acestei probe, vă asigurați că documentul este semnat în siguranță și recunoscut în sistemul Gov-Smart. Asigurați-vă că urmați instrucțiunile pentru a finaliza și securiza tranzacția.",
      },
      certificateFile: {
        title: "Alegeți Fișierul de Semnătură Electronică",
        description:
          "Pentru a semna documentul, selectați fișierul de semnătură electronică stocat pe stick-ul USB sau laptop. Acest fișier conține semnătura digitală, care va fi aplicată documentului. Asigurați-vă că alegeți fișierul corect pentru a continua procesul de semnare. După selectare, încărcați fișierul pentru a continua.",
      },
      privateKeyPassword: {
        title: "Decriptați Semnătura Electronică",
        description:
          "Pentru a continua cu semnarea documentului, introduceți parola pe care ați creat-o pentru a cripta semnătura electronică. Această parolă este necesară pentru a decripta fișierul de semnătură, asigurându-vă că doar dumneavoastră îl puteți aplica documentelor. Asigurați-vă că introduceți parola corect pentru a debloca și utiliza semnătura digitală în siguranță.",
      },
    },
  },
};

interface FormData {
  privateKeyFile: File | null;
  privateKeyPassword: string;
  passphrase: string;
  fileHash: string;
  password: string;
}

const validationSchema = v.object({
  privateKeyFile: v.optional(v.file()),
  privateKeyPassword: v.optional(v.string()),
  passphrase: v.optional(v.string()),
  fileHash: v.optional(v.string()),
  password: v.optional(v.string()),
});

type StepType =
  | "choose"
  | "brainwalletPassphrase"
  | "brainwalletPassword"
  | "certificateFile"
  | "privateKeyPassword"
  | "fileHash"
  | "result";

const SignatureTool: React.FC = () => {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: valibotResolver(validationSchema),
    defaultValues: {
      privateKeyFile: null,
      privateKeyPassword: "",
      passphrase: "",
      fileHash: "",
      password: "",
    },
  });

  const currentLanguage = useCurrentLanguage();

  const [generationMethod, setGenerationMethod] = useState<"brainwallet" | "certificate" | null>(
    null,
  );
  const [signedHash, setSignedHash] = useState<string | null>(null);
  const [step, setStep] = useState<
    | "choose"
    | "brainwalletPassphrase"
    | "brainwalletPassword"
    | "certificateFile"
    | "privateKeyPassword"
    | "fileHash"
    | "result"
  >("choose");

  const initialStepRef = useRef<HTMLDivElement>(null);
  const parentDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateParentHeight = () => {
      if (parentDivRef.current) {
        parentDivRef.current.style.height = `${initialStepRef.current?.offsetHeight}px`;
      }
    };

    updateParentHeight();
  }, [step]);

  const validatePassword = async (data: FormData): Promise<boolean> => {
    const reader = new FileReader();
    return new Promise<boolean>((resolve) => {
      reader.onload = async (e) => {
        const pkcs12FileBase64 = e.target?.result as string;
        const password = data.privateKeyPassword;

        try {
          const pkcs12Der = forge.util.decode64(pkcs12FileBase64);
          const pkcs12Asn1 = forge.asn1.fromDer(pkcs12Der);
          forge.pkcs12.pkcs12FromAsn1(pkcs12Asn1, false, password);
          resolve(true);
        } catch (error) {
          resolve(false);
        }
      };
      if (data.privateKeyFile) {
        reader.readAsText(data.privateKeyFile);
      } else {
        resolve(false);
      }
    });
  };

  const handleSignContent = async (pkcs12FileBase64: string, password: string, hash: string) => {
    return new Promise<string>((resolve, reject) => {
      try {
        const pkcs12Der = forge.util.decode64(pkcs12FileBase64);
        const pkcs12Asn1 = forge.asn1.fromDer(pkcs12Der);
        const pkcs12 = forge.pkcs12.pkcs12FromAsn1(pkcs12Asn1, false, password);

        const pkcs8ShroudedKeyBagType = forge.pki.oids.pkcs8ShroudedKeyBag;
        if (!pkcs8ShroudedKeyBagType) {
          throw new Error("Invalid bag type.");
        }

        const bags = pkcs12.getBags({
          bagType: pkcs8ShroudedKeyBagType,
        });
        const bag = bags[pkcs8ShroudedKeyBagType];

        if (!bag?.[0]?.key) {
          throw new Error(translationsObject[currentLanguage].errors.noPrivateKeyFound);
        }

        const privateKey = bag[0].key;
        if ("n" in privateKey && "e" in privateKey) {
          // TODO
        } else {
          throw new Error(translationsObject[currentLanguage].errors.notAnRsaPrivateKey);
        }

        const md = forge.md.sha256.create();
        md.update(hash, "utf8");

        const signature = privateKey.sign(md);
        const signatureBase64 = forge.util.encode64(signature);

        resolve(signatureBase64);
      } catch (error) {
        console.error("Error signing content:", error);
        reject(error);
      }
    });
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (generationMethod === "brainwallet") {
      // Handle brainwallet submission
    } else if (generationMethod === "certificate") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const pkcs12FileBase64 = e.target?.result as string;
        const password = data.privateKeyPassword;
        const fileHash = data.fileHash;

        try {
          const signatureBase64 = await handleSignContent(pkcs12FileBase64, password, fileHash);
          setSignedHash(signatureBase64);
          setStep("result");
        } catch (error) {
          if (
            (
              error as {
                message: string;
              }
            ).message.includes("Invalid password")
          ) {
            alert(translationsObject[currentLanguage].invalidPassword);
          } else {
            alert(translationsObject[currentLanguage].failedToSign);
          }
        }
      };
      if (data.privateKeyFile) {
        reader.readAsText(data.privateKeyFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const eventTarget = e.target as HTMLInputElement;
    if (eventTarget.files?.[0]) {
      setValue("privateKeyFile", eventTarget.files[0]);
    }
  };

  const goBack = () => {
    if (step === "result") {
      setStep("fileHash");
    } else if (step === "fileHash") {
      setStep(generationMethod === "brainwallet" ? "brainwalletPassphrase" : "privateKeyPassword");
    } else if (step === "privateKeyPassword") {
      setStep("certificateFile");
    } else if (step === "brainwalletPassword") {
      setStep("brainwalletPassphrase");
    } else if (step === "certificateFile" || step === "brainwalletPassphrase") {
      setStep("choose");
    }
  };

  const goToNextStep = async () => {
    if (step === "choose") {
      if (generationMethod === "brainwallet") {
        setStep("brainwalletPassphrase");
      } else if (generationMethod === "certificate") {
        setStep("certificateFile");
      }
    } else if (step === "brainwalletPassphrase") {
      setStep("fileHash");
    } else if (step === "brainwalletPassword" || step === "privateKeyPassword") {
      setStep("fileHash");
    } else if (step === "certificateFile") {
      setStep("privateKeyPassword");
    } else if (step === "fileHash") {
      const data = {
        privateKeyFile: watch("privateKeyFile"),
        privateKeyPassword: watch("privateKeyPassword"),
        passphrase: watch("passphrase"),
        fileHash: watch("fileHash"),
        password: watch("password"),
      };
      if (data.privateKeyFile && data.privateKeyPassword) {
        const isValidPassword = await validatePassword(data);
        if (isValidPassword) {
          handleSubmit(onSubmit)();
          setStep("result");
        } else {
          alert(translationsObject[currentLanguage].invalidPassword);
        }
      } else {
        alert(translationsObject[currentLanguage].invalidPassword);
      }
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const passphraseArray = watch("passphrase").split(" ");

  const handlePassphraseChange = (index: number, value: string) => {
    const updatedPassphraseArray = [...passphraseArray];
    updatedPassphraseArray[index] = value;
    setValue("passphrase", updatedPassphraseArray.join(" "));
  };

  const stepsList = [
    {
      stepId: "choose",
      label: translationsObject[currentLanguage].stepsLabels.choose,
    },
    ...(generationMethod === "brainwallet"
      ? [
          {
            stepId: "brainwalletPassphrase",
            label: translationsObject[currentLanguage].stepsLabels.brainwalletPassphrase,
          },
        ]
      : []),
    ...(generationMethod === "certificate"
      ? [
          {
            stepId: "certificateFile",
            label: translationsObject[currentLanguage].stepsLabels.certificateFile,
          },
          {
            stepId: "privateKeyPassword",
            label: translationsObject[currentLanguage].stepsLabels.privateKeyPassword,
          },
        ]
      : []),
    {
      stepId: "fileHash",
      label: translationsObject[currentLanguage].stepsLabels.fileHash,
    },
    {
      stepId: "result",
      label: translationsObject[currentLanguage].stepsLabels.result,
    },
  ];

  const mappedStepList = stepsList.map((s) => {
    const currentStepIndex = stepsList.findIndex((st) => st.stepId === step);
    const idx = stepsList.findIndex((st) => st.stepId === s.stepId);

    return {
      ...s,
      completed: idx < currentStepIndex,
    };
  }) as {
    stepId: StepType;
    label: string;
    completed: boolean;
  }[];

  const currentStepIndex = mappedStepList.findIndex((s) => s.stepId === step);

  return (
    <div
      className="relative overflow-hidden min-h-screen flex items-center justify-center"
      style={
        {
          "--color-primary-ornament": "22 163 74",
        } as React.CSSProperties
      }
    >
      <div
        className={`bg-green-600 transition-all duration-500 absolute top-0 -right-1/2 -translate-x-1/2 -translate-y-1/2 w-[max(75vh,75vh)] h-[max(75vh,75vh)] rounded-full z-0 blur-[90px]`}
      ></div>
      <ResponsiveLayout
        primaryContent={
          <div className="container mx-auto p-4">
            <div ref={parentDivRef} className="w-full rounded z-10 relative overflow-visible">
              <div
                ref={initialStepRef}
                className={`xl:max-h-[60vh] overflow-y-auto duration-300 absolute w-full top-1/2 -translate-y-1/2 left-0 transition-all ${
                  step === "choose"
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-125 pointer-events-none"
                }`}
              >
                <ThreeStateCard<"brainwallet" | "certificate">
                  initialState={generationMethod}
                  leftValue="brainwallet"
                  leftLabel="Brain Wallet"
                  leftIcon="solar:wallet-bold"
                  rightValue="certificate"
                  rightLabel="Locally Stored Signature"
                  rightIcon="carbon:certificate"
                  leftDescription={
                    <p className="opacity-80">
                      {translationsObject[currentLanguage].brainWalletDescription}
                    </p>
                  }
                  rightDescription={
                    <p className="opacity-80">
                      {translationsObject[currentLanguage].locallyStoredSignatureDescription}
                    </p>
                  }
                  onStateChange={setGenerationMethod}
                />
              </div>

              {generationMethod === "brainwallet" && (
                <>
                  <div
                    ref={initialStepRef}
                    className={`xl:max-h-[60vh] overflow-y-auto duration-300 absolute w-full top-1/2 -translate-y-1/2 left-0 transition-all ${
                      step === "brainwalletPassphrase"
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-125 pointer-events-none"
                    }`}
                  >
                    <label
                      htmlFor="passphrase"
                      className="block mb-2 text-md font-medium text-gray-900"
                    >
                      {translationsObject[currentLanguage].passphraseWords}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                      {Array.from({ length: 10 }).map((_, index) => (
                        <FormInput
                          key={index}
                          id={`word-${index}`}
                          value={passphraseArray[index] || ""}
                          onChange={(e) => handlePassphraseChange(index, e.target.value)}
                          type="text"
                          placeholder={`${translationsObject[currentLanguage].wordPlaceholder} ${
                            index + 1
                          }`}
                        />
                      ))}
                    </div>
                    {errors.passphrase && (
                      <div className="error-text">{errors.passphrase.message}</div>
                    )}
                  </div>

                  <div
                    ref={initialStepRef}
                    className={`xl:max-h-[60vh] overflow-y-auto duration-300 absolute w-full top-1/2 -translate-y-1/2 left-0 transition-all ${
                      step === "brainwalletPassword"
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-125 pointer-events-none"
                    }`}
                  >
                    <FormInput
                      label={translationsObject[currentLanguage].password}
                      id="password"
                      value={watch("password")}
                      type="password"
                      onChange={(e) => setValue("password", e.target.value)}
                      placeholder={translationsObject[currentLanguage].enterPassword}
                      error={errors.password?.message}
                    />
                  </div>
                </>
              )}

              {generationMethod === "certificate" && (
                <>
                  <div
                    ref={initialStepRef}
                    className={`xl:max-h-[60vh] overflow-y-auto duration-300 absolute w-full top-1/2 -translate-y-1/2 left-0 transition-all ${
                      step === "certificateFile"
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-125 pointer-events-none"
                    }`}
                  >
                    <FormInput
                      label={translationsObject[currentLanguage].uploadPrivateKey}
                      id="privateKeyFile"
                      value=""
                      type="file"
                      onChange={handleFileChange}
                      error={errors.privateKeyFile?.message}
                    />
                  </div>

                  <div
                    ref={initialStepRef}
                    className={`xl:max-h-[60vh] overflow-y-auto duration-300 absolute w-full top-1/2 -translate-y-1/2 left-0 transition-all ${
                      step === "privateKeyPassword"
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-125 pointer-events-none"
                    }`}
                  >
                    <FormInput
                      label={translationsObject[currentLanguage].privateKeyPassword}
                      id="privateKeyPassword"
                      value={watch("privateKeyPassword")}
                      type="password"
                      onChange={(e) => setValue("privateKeyPassword", e.target.value)}
                      placeholder={translationsObject[currentLanguage].enterPassword}
                      error={errors.privateKeyPassword?.message}
                    />
                  </div>
                </>
              )}

              <div
                ref={initialStepRef}
                className={`xl:max-h-[60vh] overflow-y-auto duration-300 absolute w-full top-1/2 -translate-y-1/2 left-0 transition-all ${
                  step === "fileHash"
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-125 pointer-events-none"
                }`}
              >
                <FormInput
                  label={translationsObject[currentLanguage].fileHash}
                  id="fileHash"
                  value={watch("fileHash")}
                  type="textarea"
                  onChange={(e) => setValue("fileHash", e.target.value)}
                  placeholder={translationsObject[currentLanguage].enterFileHash}
                  error={errors.fileHash?.message}
                />
              </div>

              <div
                ref={initialStepRef}
                className={`xl:max-h-[60vh] overflow-y-auto duration-300 absolute w-full top-1/2 -translate-y-1/2 left-0 transition-all ${
                  step === "result"
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-125 pointer-events-none"
                }`}
              >
                <FormInput
                  label={translationsObject[currentLanguage].signedHash}
                  id="signedHash"
                  value={signedHash || ""}
                  type="textarea"
                  readOnly
                  minRows={10}
                  maxRows={10}
                  copyToClipboard
                />
              </div>
            </div>
          </div>
        }
        secondaryContent={
          <>
            {step === "choose" && (
              <div className="w-full rounded z-10">
                <div>
                  <div className="mb-4">
                    <p className="font-semibold transition-all text-lg text-green-600">
                      {translationsObject[currentLanguage].stepsSecondaryContent.choose.title}
                    </p>
                  </div>
                  <p className="text-gray-500 mb-4">
                    {translationsObject[currentLanguage].stepsSecondaryContent.choose.description}
                  </p>
                </div>
              </div>
            )}
            {step === "brainwalletPassphrase" && (
              <div className="w-full rounded z-10">
                <div>
                  <div className="mb-4">
                    <p className="font-semibold transition-all text-lg text-green-600">
                      {
                        translationsObject[currentLanguage].stepsSecondaryContent
                          .brainwalletPassphrase.title
                      }
                    </p>
                  </div>
                  <p className="text-gray-500 mb-4">
                    {
                      translationsObject[currentLanguage].stepsSecondaryContent
                        .brainwalletPassphrase.description
                    }
                  </p>
                </div>
              </div>
            )}
            {step === "fileHash" && (
              <div className="w-full rounded z-10">
                <div>
                  <div className="mb-4">
                    <p className="font-semibold transition-all text-lg text-green-600">
                      {translationsObject[currentLanguage].stepsSecondaryContent.fileHash.title}
                    </p>
                  </div>
                  <p className="text-gray-500 mb-4">
                    {translationsObject[currentLanguage].stepsSecondaryContent.fileHash.description}
                  </p>
                </div>
              </div>
            )}
            {step === "result" && (
              <div className="w-full rounded z-10">
                <div>
                  <div className="mb-4">
                    <p className="font-semibold transition-all text-lg text-green-600">
                      {translationsObject[currentLanguage].stepsSecondaryContent.result.title}
                    </p>
                  </div>
                  <p className="text-gray-500 mb-4">
                    {translationsObject[currentLanguage].stepsSecondaryContent.result.description}
                  </p>
                </div>
              </div>
            )}
            {step === "certificateFile" && (
              <div className="w-full rounded z-10">
                <div>
                  <div className="mb-4">
                    <p className="font-semibold transition-all text-lg text-green-600">
                      {
                        translationsObject[currentLanguage].stepsSecondaryContent.certificateFile
                          .title
                      }
                    </p>
                  </div>
                  <p className="text-gray-500 mb-4">
                    {
                      translationsObject[currentLanguage].stepsSecondaryContent.certificateFile
                        .description
                    }
                  </p>
                </div>
              </div>
            )}
            {step === "privateKeyPassword" && (
              <div className="w-full rounded z-10">
                <div>
                  <div className="mb-4">
                    <p className="font-semibold transition-all text-lg text-green-600">
                      {
                        translationsObject[currentLanguage].stepsSecondaryContent.privateKeyPassword
                          .title
                      }
                    </p>
                  </div>
                  <p className="text-gray-500 mb-4">
                    {
                      translationsObject[currentLanguage].stepsSecondaryContent.privateKeyPassword
                        .description
                    }
                  </p>
                </div>
              </div>
            )}
          </>
        }
        navigation={
          <div className="flex justify-center w-full gap-2 pt-2">
            {step !== "choose" && (
              <button
                onClick={goBack}
                className="h-12 w-12 rounded-full flex items-center justify-center transition-all border-green-500 border-2 text-green-500 hover:bg-green-500 hover:text-white hover:opacity-90 active:opacity-80 disabled:opacity-30 disabled:pointer-events-none"
              >
                <Icon icon="fluent:play-32-filled" className="transform rotate-180" />
              </button>
            )}
            {step !== "result" && (
              <button
                onClick={goToNextStep}
                className="text-white h-12 w-12 rounded-full flex items-center justify-center transition-all bg-green-500 hover:opacity-90 active:opacity-80 disabled:opacity-30 disabled:pointer-events-none"
                disabled={
                  (step === "choose" && !generationMethod) ||
                  (step === "brainwalletPassphrase" &&
                    passphraseArray.filter(Boolean).length < 10) ||
                  (step === "brainwalletPassword" && !watch("password")) ||
                  (step === "certificateFile" && !watch("privateKeyFile")) ||
                  (step === "privateKeyPassword" && !watch("privateKeyPassword")) ||
                  (step === "fileHash" && !watch("fileHash"))
                }
              >
                <Icon icon="fluent:play-32-filled" />
              </button>
            )}
          </div>
        }
        progressBar={
          <div className="w-full">
            <Stepper currentStepIndex={currentStepIndex} steps={mappedStepList} />
          </div>
        }
      />
    </div>
  );
};

export default SignatureTool;
