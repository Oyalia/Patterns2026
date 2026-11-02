/**
 * Prototype Pattern: Base Interface
 * Declares the cloning interface for components that can replicate themselves.
 */
export class Prototype {
    /**
     * Creates a deep or customized copy of the prototype.
     * @returns {Prototype}
     */
    clone() {
        throw new Error("Method 'clone()' must be implemented by concrete prototype.");
    }
}
