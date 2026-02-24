const Testimonial = require('../models/Testimonial');

const getPublicTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({
      status: 'approved',
      isPublic: true,
      isActive: true
    }).sort({ order: 1, createdAt: -1 });

    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const submitTestimonial = async (req, res) => {
  try {
    const {
      name,
      email,
      designation,
      location,
      quote,
      consentToPublish
    } = req.body;

    if (!name || !email || !quote) {
      return res.status(400).json({ message: 'Name, email and feedback are required' });
    }

    if (!(consentToPublish === true || consentToPublish === 'true')) {
      return res.status(400).json({ message: 'Consent to publish is required' });
    }

    const testimonial = new Testimonial({
      name,
      email,
      designation: designation || '',
      location: location || '',
      quote,
      consentToPublish: true,
      status: 'pending',
      isPublic: false,
      source: 'contact_form'
    });

    await testimonial.save();
    res.status(201).json({ message: 'Feedback submitted successfully and is pending review' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const getAllTestimonialsAdmin = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateTestimonialAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = {
      name: req.body.name,
      email: req.body.email,
      designation: req.body.designation || '',
      location: req.body.location || '',
      quote: req.body.quote,
      status: req.body.status,
      isPublic: req.body.isPublic === true || req.body.isPublic === 'true',
      isActive: req.body.isActive === true || req.body.isActive === 'true',
      order: Number.isFinite(Number(req.body.order)) ? Number(req.body.order) : 0,
      updatedAt: Date.now()
    };

    const testimonial = await Testimonial.findByIdAndUpdate(id, payload, { new: true });
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json(testimonial);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

const deleteTestimonialAdmin = async (req, res) => {
  try {
    const deleted = await Testimonial.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getPublicTestimonials,
  submitTestimonial,
  getAllTestimonialsAdmin,
  updateTestimonialAdmin,
  deleteTestimonialAdmin
};
