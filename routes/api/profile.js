const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const request = require('request');
const config = require('config');


 //@route Get api/profile/me
//@desc  Get current users profile
//@access Profile
router.get('/me',auth, async (req,res) => {
    try {
        const profile= await Profile.findOne({user: req.user.id})
            .populate('user', ['name', 'avatar']);
        if (!profile){
            return res.status(400).json({msg: 'There no profile to this user'});
        }
        res.json(profile);

    } catch (err){
        console.error(err);
        res.status(500).send('Server Error');
    }

});


//@route Post api/profile/me
//@desc  Create or update user Profile
//@access Private
router.post('/', [auth, [
    check('status', 'status is required')
        .not()
        .isEmpty(),
    check('skills', 'skills is required ')
        .not()
        .isEmpty()

]],async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const { company, website, location, bio, status, skills,
        githubusername, youtube, twitter,
        facebook, linkedin, instagram } = req.body;

    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if ( skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;
    
    try {
        let profile = await Profile.findOne({ user: req.user.id});
        if (profile){
            //update
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set: profileFields},
                {new: true}
            );
            return res.json(profile);
        }
        //create
        profile = new Profile(profileFields);
        await profile.save();
        await res.json(profile);

    }catch (err) {
        console.error(err.message);
        res.status(500).send('Server ERROR');
    }

});

//@route Get api/profile
//@desc  Get all profiles
//@access Public
router.get('/', async (req, res) => {
try {
    const profiles = await Profile.find().populate('user', ['name','avatar']);
    await res.json(profiles);
    
}   catch (err) {
    console.error(err.message);
    res.status(500).send('Server ERROR');
} 
    
});


//@route Get api/profile/user/:user_id
//@desc  Get all profiles by user id
//@access Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile
            .findOne({user : req.params.user_id})
            .populate('user', ['name','avatar']);
        if (!profile) return res.status(400)
            .json({msg : 'Profile not found'});
        await res.json(profile);

    }   catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId'){
            return res.status(400).json({msg:'Profile not found'})
        }
        res.status(500).send('Server ERROR');
    }

});
//@route Delete api/profile
//@desc  Delete profile , user & posts
//@access private
router.delete('/', auth , async (req, res) => {
    try {
        //to do -remove users posts
        //remove profile
        await Profile.findOneAndRemove({user: req.user.id});
        //remove user
        await User.findOneAndRemove({_id: req.user.id});

        await res.json({msg: 'user deleted'});

    }   catch (err) {
        console.error(err.message);
        res.status(500).send('Server ERROR');
    }

});
//@route PUT api/profile/experience
//@desc  add profile experience
//@access private
router.put('/experience',
    [
     auth,
        [
        check('title', 'Title is required')
            .not()
            .isEmpty(),
        check('company', 'Company is required')
            .not()
            .isEmpty(),
        check('from', 'from date is required')
            .not()
            .isEmpty()
        ]
    ],async (req,res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        };
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body
        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }
        try{
            const profile = await Profile.findOne({user: req.user.id});
            profile.experience.unshift(newExp);
            await profile.save();
            res.json(profile);

        }catch (err) {
            console.error(err.message);
            res.status(500).send('server error')
        }


    });
//@route Delete api/profile/experience/exp_id
//@desc  Delete
//@access private
router.delete('/experience/:exp_id', auth, async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id});
        //get the experience to remove
        const removeIndex = profile.experience.map(item => item.id)
            .indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex,1);
        await profile.save();
        res.json(profile);
    }catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});
//@route PUT api/profile/education
//@desc  add profile education
//@access private
router.put('/education/',[
    auth,
    [
    check('school', 'school is required')
        .not()
        .isEmpty(),
    check('degree', 'Degree is required')
        .not()
        .isEmpty(),
    check('fieldofstudy', 'field of study is required')
        .not()
        .isEmpty(),
    check('from', 'from date is required')
        .not()
        .isEmpty()
    ]],
    async (req,res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})};
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body
        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }
try {
    const profile = await Profile.findOne({user: req.user.id});
    profile.education.unshift(newEdu);
    await profile.save();
    res.json(profile);

}catch(err) {
    console.error(err.message);
    res.status(500).send('server error');
}
});
//@route Delete api/profile/education/edu_id
//@desc  Delete
//@access private
router.delete('/education/:edu_id', auth, async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id});
        //get the education to remove
        const removeIndex = profile.education.map(item => item.id)
            .indexOf(req.params.edu_id);
        profile.education.splice(removeIndex,1);
        await profile.save();
        res.json(profile);
    }catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});
//@route Get api/profile/github/:username
//@desc  get user repos from github
//@access Public
router.get('/github/:username',(req,res) => {
    try {
        const options = {
         uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method:'GET',
            headers: {'user-agent': 'node.js'}

        };
        request(options, (error,response,body) => {
            if (error) console.error(error);
            if (res.statusCode !== 200){
                res.status(404).json({msg: 'No Github profile found'});
            }
            res.json(JSON.parse(body));


        });

    }catch (err) {
        console.error(err.message);
        res.status(500).send('server error');

    }
})
module.exports = router;
