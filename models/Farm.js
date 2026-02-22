import mongoose from "mongoose";

const FarmSchema = new mongoose.Schema({
  owner_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  name: { 
    type: String, 
    required: true 
  },

  location: String,

  longueur: { 
    type: Number, 
    required: true 
  },

  largeur: { 
    type: Number, 
    required: true 
  },

  created_at: { 
    type: Date, 
    default: Date.now 
  },
});

export default mongoose.models.Farm || mongoose.model("Farm", FarmSchema);