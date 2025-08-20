
'use server';

import { doc, getDoc, setDoc, collection, getDocs, writeBatch, query as firestoreQuery } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface Skill {
    id?: string; // Firestore uses string IDs
    name: string;
}
export interface AboutPageContent {
    mission_title: string;
    mission_description: string;
    mission_image: string;
    stack_title: string;
    stack_description: string;
    skills: Omit<Skill, 'id'>[];
}

const aboutPageDocRef = doc(firestore, 'pages', 'about');
const skillsCollectionRef = collection(firestore, 'skills');

export async function getAboutPageContent(): Promise<AboutPageContent | null> {
    try {
        const aboutDocSnap = await getDoc(aboutPageDocRef);
        let aboutData: Omit<AboutPageContent, 'skills'>;

        if (aboutDocSnap.exists()) {
            aboutData = aboutDocSnap.data() as Omit<AboutPageContent, 'skills'>;
        } else {
            aboutData = {
                mission_title: 'Our Mission',
                mission_description: 'At WebDesignBro, our mission is to empower businesses...',
                mission_image: 'https://placehold.co/600x800.png',
                stack_title: 'Our Tech Stack',
                stack_description: 'We use a modern, robust tech stack...',
            };
            await setDoc(aboutPageDocRef, aboutData);
        }

        const skillsSnapshot = await getDocs(skillsCollectionRef);
        const skills: Skill[] = skillsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Skill));

        if (skills.length === 0) {
            // Seed default skills if none exist
            const defaultSkills = [{ name: 'Next.js' }, { name: 'React' }, { name: 'Firebase' }];
            const batch = writeBatch(firestore);
            defaultSkills.forEach(skill => {
                const newDocRef = doc(skillsCollectionRef);
                batch.set(newDocRef, skill);
            });
            await batch.commit();
            return getAboutPageContent(); // Re-fetch to get IDs
        }

        return { ...aboutData, skills };

    } catch (error) {
        console.error('Failed to fetch about page content:', error);
        return null;
    }
}

export async function updateAboutPageContent(content: AboutPageContent): Promise<void> {
    try {
        const batch = writeBatch(firestore);

        const { skills, ...aboutData } = content;
        batch.set(aboutPageDocRef, aboutData, { merge: true });

        // First, delete all existing skills
        const existingSkillsSnap = await getDocs(skillsCollectionRef);
        existingSkillsSnap.docs.forEach(doc => batch.delete(doc.ref));

        // Then, add the new skills
        content.skills.forEach(skill => {
            if (skill.name) {
                const newSkillRef = doc(skillsCollectionRef);
                batch.set(newSkillRef, { name: skill.name });
            }
        });

        await batch.commit();

        revalidatePath('/about');
        revalidatePath('/admin/settings');
    } catch (error) {
        console.error('Failed to update about page content:', error);
        throw error;
    }
}
