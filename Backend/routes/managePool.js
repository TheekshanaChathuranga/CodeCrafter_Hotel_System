import express from 'express';
import Pool from '../models/Pool.js';
import { upload, handleUploadErrors } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Helper function to delete pool images
const deletePoolImages = (images) => {
  images.forEach(imagePath => {
    try {
      const filename = path.basename(imagePath);
      const filePath = path.join(process.cwd(), 'uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting pool image:', error);
    }
  });
};

// Create new pool
router.post('/add',
  upload.array('images', 5), // Allows up to 5 images
  handleUploadErrors,
  async (req, res) => {
    try {
      const { 
        name, 
        description, 
        capacity, 
        poolStatus, 
        openingTime, 
        closingTime,  
      } = req.body;

      // Basic validation
      if (!name || !description || !capacity || !poolStatus || !openingTime || !closingTime || !req.body.pricePerPersonHour) {
        throw new Error('Missing required fields');
      }

      let unavailablePeriod = undefined;
      if (req.body.unavailablePeriod) {
        try {
          const parsed = JSON.parse(req.body.unavailablePeriod);
          if (parsed.start && parsed.end) {
            unavailablePeriod = {
              start: new Date(parsed.start),
              end: new Date(parsed.end)
            };
          }
        } catch (e) {
          throw new Error("Invalid unavailablePeriod format");
        }
      }

      const pool = new Pool({
        name,
        description,
        capacity: parseInt(capacity),
        poolStatus: poolStatus || 'Available',
        openingTime,
        closingTime,
        pricePerPersonHour: parseFloat(req.body.pricePerPersonHour),
        images: req.files?.map(file => `/uploads/${file.filename}`) || [],
        ...(unavailablePeriod && { unavailablePeriod })
      });

      await pool.save();
      res.status(201).json(pool);
    } catch (error) {
      // Cleanup uploaded files if error occurs
      if (req.files) {
        deletePoolImages(req.files.map(f => `/uploads/${f.filename}`));
      }
      res.status(400).json({ 
        error: error.message,
        details: error.name === 'ValidationError' ? error.errors : undefined
      });
    }
  }
);

// Get all pools
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const pools = await Pool.find(filter).sort({ name: 1 });
    res.json(pools);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pools' });
  }
});

// Get single pool
router.get('/:id', async (req, res) => {
  try {
    const pool = await Pool.findById(req.params.id);
    if (!pool) {
      return res.status(404).json({ error: 'Pool not found' });
    }
    res.json(pool);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pool' });
  }
});

// Update pool
router.put('/update/:id',
  upload.array('images', 5),
  handleUploadErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        deletedImages, 
        ...updateData 
      } = req.body;

      const pool = await Pool.findById(id);
      if (!pool) {
        return res.status(404).json({ error: 'Pool not found' });
      }

      // Handle deleted images
      const imagesToDelete = deletedImages ? JSON.parse(deletedImages) : [];
      deletePoolImages(imagesToDelete);

      // Filter out deleted images
      const remainingImages = pool.images.filter(
        img => !imagesToDelete.includes(img)
      );

      // Prepare update
      const update = {
        ...updateData,
        images: [
          ...remainingImages,
          ...(req.files?.map(file => `/uploads/${file.filename}`) || [])
        ],
        rules: typeof updateData.rules === 'string' 
          ? JSON.parse(updateData.rules) 
          : updateData.rules
      };

      // Numeric fields
      if (updateData.capacity) {
        update.capacity = parseInt(updateData.capacity);
      }
      if (updateData.pricePerPersonHour) {
        update.pricePerPersonHour = parseFloat(updateData.pricePerPersonHour);
      }

      let unavailablePeriod = undefined;
      if (updateData.unavailablePeriod) {
        try {
          const parsed = JSON.parse(updateData.unavailablePeriod);
          if (parsed.start && parsed.end) {
            unavailablePeriod = {
              start: new Date(parsed.start),
              end: new Date(parsed.end)
            };
          }
        } catch (e) {
          throw new Error("Invalid unavailablePeriod format");
        }
      }
      if (unavailablePeriod) update.unavailablePeriod = unavailablePeriod;

      const updatedPool = await Pool.findByIdAndUpdate(
        id, 
        update, 
        { new: true, runValidators: true }
      );

      res.json(updatedPool);
    } catch (error) {
      // Cleanup newly uploaded files if error occurs
      if (req.files) {
        deletePoolImages(req.files.map(f => `/uploads/${f.filename}`));
      }
      res.status(400).json({ 
        error: error.message,
        details: error.name === 'ValidationError' ? error.errors : undefined
      });
    }
  }
);

// Delete pool
router.delete('/delete/:id', async (req, res) => {
  try {
    console.log("Deleting pool with ID:", req.params.id); 
    const pool = await Pool.findByIdAndDelete(req.params.id);
    if (!pool) {
      return res.status(404).json({ error: 'Pool not found' });
    }

    // Delete all associated images
    deletePoolImages(pool.images);

    res.json({ message: 'Pool deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pool' });
  }
});

export default router;