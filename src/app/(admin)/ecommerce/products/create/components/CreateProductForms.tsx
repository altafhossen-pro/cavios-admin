import clsx from 'clsx'
import { useState } from 'react'
import { Tab, Tabs } from 'react-bootstrap'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { TabMenuItem } from '@/types/menu'
import GeneralDetailsForm from './GeneralDetailsForm'
import MetaDataForm from './MetaDataForm'
import ProductGalleryForm from './ProductGalleryForm'
import ProductSubmittedForm from './ProductSubmittedForm'

const formSteps: TabMenuItem[] = [
  {
    index: 1,
    name: 'General Detail',
    icon: 'bxs:contact',
    tab: <GeneralDetailsForm />,
  },
  {
    index: 2,
    name: 'Product Images',
    icon: 'bx:images',
    tab: <ProductGalleryForm />,
  },
  {
    index: 3,
    name: 'Meta Data',
    icon: 'bxs:book',
    tab: <MetaDataForm />,
  },
  {
    index: 4,
    name: 'Finish',
    icon: 'bxs:check-circle',
    tab: <ProductSubmittedForm />,
  },
]

const CreateProductForms = () => {
  const [activeStep, setActiveStep] = useState<number>(1)


  // const [userType, setUserType] = useState('');
  // const [step2Part, setStep2Part] = useState(0);
  // const [step, setStep] = useState(1);
  // const { watch, control, getValues, setValue, trigger, clearErrors, resetField } = useFormContext();
  // const { showPageLoader } = useContext(CommonContext);
  // const { status, data: sessionData, update } = useSession();

  // const handleBackButton = () => {
  //   clearErrors();
  //   resetField('fullname');
  //   resetField('agentName');
  //   resetField('ARN');
  //   setValue('userType', '');
  // };

  // const handleUserType = (type) => {
  //   if (type === 'generalUser') {
  //     setValue('isAgent', false);
  //     setValue('userType', type);

  //     if (isSocialPopup) handleUserRegistration();
  //   } else if (type === 'accountant') {
  //     setValue('isAgent', true);
  //     setValue('userType', type);
  //   }
  // };

  // const handleUserTypeSubmit = () => {
  //   console.log('userType selected:', userType);

  //   // Check if a user type is selected
  //   if (!userType) {
  //     ToastHelper.error('Please select a user type');
  //     return;
  //   }

  //   // Handle the user type selection first
  //   if (userType === 'generalUser') {
  //     setValue('isAgent', false);
  //     setValue('userType', userType);
  //     // For general users, proceed directly to registration
  //     handleUserRegistration();
  //   } else if (userType === 'accountant') {
  //     setValue('isAgent', true);
  //     setValue('userType', userType);
  //     // For accountants, show company info form
  //   }
  //   setStep2Part(1);
  // };

  // const verifyUserVRN = async (e) => {
  //   e.preventDefault();
  //   console.log('Lookup button clicked'); // Debug log

  //   try {
  //     resetField('businessName');
  //     resetField('registeredAddress');

  //     const isValid = await trigger(['AgentReferenceNumber']);
  //     console.log('Validation result:', isValid); // Debug log
  //     if (!isValid) return;

  //     const VRN = getValues('AgentReferenceNumber');
  //     console.log('VRN value:', VRN); // Debug log
  //     if (!VRN) return;
  //     // get session data from nextauth

  //     showPageLoader(true);
  //     console.log('Calling VerifyVRNHelper...'); // Debug log
  //     const response = await VerifyVRNHelper({
  //       isGuestUser: false,
  //       VRN,
  //       userID: sessionData?.user?.userID || null,
  //       state: STATE,
  //       email: sessionData?.user?.email || getValues('email'),
  //     });
  //     console.log('VerifyVRNHelper response:', response); // Debug log

  //     if (response && response.data && response.data.data) {
  //       setValue('businessName', response.data.data.name);
  //       setValue('registeredAddress', response.data.data.address?.line1 + ' ' + response.data.data.address?.postcode + ' ' + response.data.data.address?.countryCode);
  //       ToastHelper.success('VRN data fetched successfully.');
  //     } else {
  //       console.error('Invalid response structure:', response);
  //       ToastHelper.error('Failed to fetch VRN data. Please try again.');
  //     }
  //   } catch (error) {
  //     console.error('VRN verification error:', error); // Debug log
  //     ToastHelper.error(error?.response?.data?.message);
  //   } finally {
  //     showPageLoader(false);
  //   }
  // };

  // const handleCompanyInfoSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const isValid = await trigger(['AgentReferenceNumber', 'businessName', 'registeredAddress']);
  //     if (isValid) {
  //       // Set the agent details for accountant users
  //       const businessName = getValues('businessName');
  //       const AgentReferenceNumber = getValues('AgentReferenceNumber');

  //       setValue('agentName', businessName);
  //       setValue('ARN', AgentReferenceNumber);

  //       // Now proceed with user registration
  //       handleUserRegistration();
  //     }
  //   } catch (error) {
  //     console.error('Company info submission error:', error);
  //     ToastHelper.error('Please fill in all required fields.');
  //   }
  // };


  return (
    <>
      <Tabs variant="underline" activeKey={activeStep} className="nav nav-tabs card-tabs" onSelect={(e) => setActiveStep(Number(e))}>
        {formSteps.map((step) => (
          <Tab
            key={step.index}
            eventKey={step.index}
            className="nav-item"
            tabClassName="pb-3"
            title={
              <span className="fw-semibold">
                <IconifyIcon icon={step.icon} className="me-1" />
                <span className="d-none d-sm-inline">{step.name}</span>
              </span>
            }>
            <>{step.tab}</>
          </Tab>
        ))}
      </Tabs>

      <div className="d-flex flex-wrap gap-2 wizard justify-content-between mt-3">
        <div className="previous me-2">
          <button onClick={() => setActiveStep(() => activeStep - 1)} className={clsx('btn btn-primary', { disabled: activeStep === 1 })}>
            <IconifyIcon icon="bx:left-arrow-alt" className="me-2" />
            Back To Previous
          </button>
        </div>
        <div className="next">
          <button
            onClick={() => setActiveStep(() => activeStep + 1)}
            className={clsx('btn btn-primary', { disabled: formSteps.length === activeStep })}>
            Next Step
            <IconifyIcon icon="bx:right-arrow-alt" className="ms-2" />
          </button>
        </div>
      </div>
    </>
  )
}

export default CreateProductForms
