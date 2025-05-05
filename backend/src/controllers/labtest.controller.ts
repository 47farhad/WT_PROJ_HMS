import LabTest from '../models/labtest.model.js';


export const createLabTest = async (req: any, res: any) => {
  const { datetime } = req.body;
  const reqUser = req.user;

  try {
    if (!datetime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newLabTest = new LabTest({
        datetime
    });

    if (newLabTest) {
      await newLabTest.save();
      return res.status(201).json({ message: 'LabTest created successfully', labtest: newLabTest });
    }
    else {
      return res.status(400).json({ message: 'Failed to create Lab Test' });
    }

  }
  catch (error) {
    console.log("Error in controller: createLabTest");
    return res.status(500).json({ message: "Internal Server Error" });
  }
}